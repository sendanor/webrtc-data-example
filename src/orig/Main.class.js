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
export default class Main extends EventEmitter {

	constructor () {
		super();

		this.servers = null;
		this.pcConstraint = null;
		this.dataConstraint = null;
	}

	/**
	 * @returns {Promise}
	 */
	createConnection () {

		this._log('Using SCTP based data channels');

		// SCTP is supported from Chrome 31 and is supported in FF.
		// No need to pass DTLS constraint as it is on by default in Chrome 31.
		// For SCTP, reliable and ordered is true by default.

		/** @member {RTCPeerConnection} */
		this.localConnection = new RTCPeerConnection(this.servers, this.pcConstraint);

		this._log('Created local peer connection object this.localConnection');

		/** @member {RTCDataChannel} */
		this.sendChannel = this.localConnection.createDataChannel('sendDataChannel', this.dataConstraint);

		this._log('Created send data channel');

		/**
		 *
		 * @param e {RTCPeerConnectionIceEvent}
		 */
		this.localConnection.onicecandidate = e => this._onIceCandidate(this.localConnection, e);

		this.sendChannel.onopen = () => this._onSendChannelStateChange();
		this.sendChannel.onclose = () => this._onSendChannelStateChange();

		/** @member {RTCPeerConnection} */
		this.remoteConnection = new RTCPeerConnection(this.servers, this.pcConstraint);

		/**
		 *
		 * @param e {RTCPeerConnectionIceEvent}
		 */
		this.remoteConnection.onicecandidate = e => this._onIceCandidate(this.remoteConnection, e);

		/**
		 *
		 * @param e {RTCDataChannelEvent}
		 */
		this.remoteConnection.ondatachannel = e => this._receiveChannelCallback(e);

		this._log('Created remote peer connection object this.remoteConnection');

		return this.localConnection.createOffer().then(
			desc => this._setLocalDescription(desc)
		).then(
			() => this.remoteConnection.createAnswer()
		).then(
			desc => this._setRemoteDescription(desc)
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

		this.receiveChannel.close();

		this._log('Closed data channel with label: ' + this.receiveChannel.label);

		this.localConnection.close();
		this.localConnection = null;

		this.remoteConnection.close();
		this.remoteConnection = null;

		this._log('Closed peer connections');

	}

	/**
	 *
	 * @param desc {RTCSessionDescriptionInit}
	 * @returns {Promise}
	 * @private
	 */
	_setLocalDescription (desc) {
		this._log('Offer from this.localConnection \n' + desc.sdp);
		return this.localConnection.setLocalDescription(desc).then(
			() => this.remoteConnection.setRemoteDescription(desc)
		);
	}

	/**
	 *
	 * @param desc {RTCSessionDescriptionInit}
	 * @returns {Promise}
	 * @private
	 */
	_setRemoteDescription (desc) {
		this._log('Answer from this.remoteConnection \n' + desc.sdp);
		return this.remoteConnection.setLocalDescription(desc).then(
			() => this.localConnection.setRemoteDescription(desc)
		);
	}

	/**
	 *
	 * @param pc {RTCPeerConnection}
	 * @returns {RTCPeerConnection}
	 * @private
	 */
	_getOtherPc (pc) {
		return (pc === this.localConnection) ? this.remoteConnection : this.localConnection;
	}

	/**
	 *
	 * @param pc {RTCPeerConnection}
	 * @returns {string}
	 * @private
	 */
	_getName (pc) {
		return (pc === this.localConnection) ? 'localPeerConnection' : 'remotePeerConnection';
	}

	/**
	 * @param pc {RTCPeerConnection}
	 * @param event {RTCPeerConnectionIceEvent}
	 * @returns {Promise}
	 * @private
	 */
	_onIceCandidate (pc, event) {

		this._log( this._getName(pc) + ' ICE candidate: \n' + (event.candidate ? event.candidate.candidate : '(null)'));

		return this._getOtherPc(pc).addIceCandidate(event.candidate).then(
			() => this._log('AddIceCandidate success.'),
			error => this._log('Failed to add Ice Candidate: ' + error)
		);
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
	_onSendChannelStateChange () {
		const readyState = this.sendChannel.readyState;
		this._log('Send channel state is: ' + readyState);
		this.emit('sendChannel:readyState:changed', readyState);
	}

	/**
	 *
	 * @private
	 */
	_onReceiveChannelStateChange () {
		const readyState = this.receiveChannel.readyState;
		this._log('Receive channel state is: ' + readyState);
	}

	/** Print log message
	 *
	 * @param msg
	 * @private
	 */
	_log (...msg) {
		console.log(...msg);
	}

}
