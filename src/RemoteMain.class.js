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
 * @typedef {object} MainOptions
 * @property servers -
 * @property pcConstraint -
 * @property dataConstraint -
 */

/**
 * @class
 */
export default class RemoteMain extends EventEmitter {

	/**
	 *
	 */
	constructor () {
		super();
	}

	/**
	 *
	 * @returns {RemoteMain}
	 */
	createConnection () {

		this._log('Using SCTP based data channels');

		// SCTP is supported from Chrome 31 and is supported in FF.
		// No need to pass DTLS constraint as it is on by default in Chrome 31.
		// For SCTP, reliable and ordered is true by default.

		/** @member {RTCPeerConnection} */
		this.remoteConnection = new RTCPeerConnection();

		/**
		 *
		 * @param e {RTCPeerConnectionIceEvent}
		 */
		this.remoteConnection.onicecandidate = e => this._onIceCandidate(e);

		/**
		 *
		 * @param e {RTCDataChannelEvent}
		 */
		this.remoteConnection.ondatachannel = e => this._receiveChannelCallback(e);

		this._log('Created remote peer connection object this.remoteConnection');

		return this;
	}

	/**
	 *
	 * @returns {Promise}
	 */
	createAnswer () {
		return this.remoteConnection.createAnswer().then(
			desc => this._setLocalDescription(desc)
		).catch(
			error => this._log('Failed to create session description: ' + error)
		);
	}

	/**
	 *
	 */
	close () {

		this.receiveChannel.close();
		this._log('Closed data channel with label: ' + this.receiveChannel.label);

		this.remoteConnection.close();
		this.remoteConnection = null;

		this._log('Closed peer connection');

	}

	/**
	 *
	 * @param desc {RTCSessionDescriptionInit}
	 * @returns {Promise}
	 * @private
	 */
	_setLocalDescription (desc) {
		this._log('Answer from this.remoteConnection \n' + desc.sdp);
		this.emit('answer', desc);
		return this.remoteConnection.setLocalDescription(desc);
	}

	/**
	 *
	 * @param desc {RTCSessionDescriptionInit}
	 * @returns {Promise}
	 * @private
	 */
	setRemoteDescription (desc) {
		return this.remoteConnection.setRemoteDescription(desc);
	}

	/**
	 * @param event {RTCPeerConnectionIceEvent}
	 * @returns {Promise}
	 * @private
	 */
	_onIceCandidate (event) {
		this._log( 'ICE candidate: \n' + (event.candidate ? event.candidate.candidate : '(null)'));
		this.emit('ice-candidate', event.candidate, event);
	}

	/**
	 *
	 * @param event {RTCDataChannelEvent}
	 * @private
	 */
	_receiveChannelCallback (event) {

		this._log('Receive Channel Callback');

		/** @member {RTCDataChannel} */
		this.receiveChannel = event.channel;

		/**
		 *
		 * @param event {MessageEvent}
		 */
		this.receiveChannel.onmessage = event => {
			this._log('Received Message');
			this.emit('message', event.data, event);
		};

		this.receiveChannel.onopen = () => this._onReceiveChannelStateChange();

		this.receiveChannel.onclose = () => this._onReceiveChannelStateChange();
	}

	/**
	 *
	 * @private
	 */
	_onReceiveChannelStateChange () {
		const readyState = this.receiveChannel.readyState;
		this._log('Receive channel state is: ' + readyState);
		this.emit('receiveChannel:readyState:changed', readyState);
	}

	/** Print log message
	 *
	 * @param msg
	 * @private
	 */
	_log (...msg) {
		console.log('[RemoteMain] ', ...msg);
	}

	/**
	 *
	 * @param candidate {RTCIceCandidate}
	 * @returns {Promise}
	 */
	addIceCandidate (candidate) {
		return this.remoteConnection.addIceCandidate(candidate);
	}

}
