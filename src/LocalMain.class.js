/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

import EventEmitter from 'wolfy87-eventemitter';
import { RTCPeerConnection } from './webrtc.js';

/**
 * @class
 */
export default class LocalMain extends EventEmitter {

	constructor () {
		super();
	}

	/**
	 *
	 * @returns {LocalMain}
	 */
	createConnection () {

		this._log('Using SCTP based data channels');

		// SCTP is supported from Chrome 31 and is supported in FF.
		// No need to pass DTLS constraint as it is on by default in Chrome 31.
		// For SCTP, reliable and ordered is true by default.

		/** @member {RTCPeerConnection} */
		this.localConnection = new RTCPeerConnection();

		this._log('Created local peer connection object this.localConnection');

		/** @member {RTCDataChannel} */
		this.sendChannel = this.localConnection.createDataChannel('sendDataChannel', null);

		this._log('Created send data channel');

		/**
		 *
		 * @param e {RTCPeerConnectionIceEvent}
		 */
		this.localConnection.onicecandidate = e => this._onIceCandidate(e);

		this.sendChannel.onopen = () => this._onSendChannelStateChange();
		this.sendChannel.onclose = () => this._onSendChannelStateChange();

		return this;
	}

	/**
	 *
	 * @returns {Promise}
	 */
	createOffer () {
		return this.localConnection.createOffer().then(
			desc => this._setLocalDescription(desc)
		).catch(
			error => this._log('Failed to create session description: ' + error)
		);
	}

	/**
	 *
	 */
	sendData (data) {
		this.sendChannel.send(data);
		this._log('Sent Data: ' + data);
	}

	/**
	 *
	 */
	close () {

		this._log('Closing data channels');

		this.sendChannel.close();
		this._log('Closed data channel with label: ' + this.sendChannel.label);

		this.localConnection.close();
		this.localConnection = null;

		this._log('Closed peer connection');

	}

	/**
	 *
	 * @param desc {RTCSessionDescriptionInit}
	 * @returns {Promise}
	 * @private
	 */
	_setLocalDescription (desc) {
		this._log('Offer from this.localConnection \n' + desc.sdp);
		this.emit('offer', desc);
		return this.localConnection.setLocalDescription(desc);
	}

	/**
	 *
	 * @param desc {RTCSessionDescriptionInit}
	 * @returns {Promise}
	 * @private
	 */
	setRemoteDescription (desc) {
		return this.localConnection.setRemoteDescription(desc);
	}

	/**
	 * @param event {RTCPeerConnectionIceEvent}
	 * @returns {Promise}
	 * @private
	 */
	_onIceCandidate (event) {
		this._log( 'ICE candidate emited: \n' + (event.candidate ? event.candidate.candidate : '(null)'));
		this.emit('ice-candidate', event.candidate, event);
	}

	/**
	 *
	 * @private
	 */
	_onSendChannelStateChange () {
		const readyState = this.sendChannel.readyState;
		this._log('Send channel state change emited: ' + readyState);
		this.emit('sendChannel:readyState:changed', readyState);
	}

	/** Print log message
	 *
	 * @param msg
	 * @private
	 */
	_log (...msg) {
		console.log('[LocalMain] ', ...msg);
	}

	/**
	 *
	 * @param candidate {RTCIceCandidate}
	 * @returns {Promise}
	 */
	addIceCandidate (candidate) {
		return this.localConnection.addIceCandidate(candidate);
	}

}
