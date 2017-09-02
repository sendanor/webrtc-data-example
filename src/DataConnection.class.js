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
 * @typedef {object} CreateConnectionOptions
 * @property {boolean} sending - Enable sending channel
 * @property {boolean} receiving - Enable receiving channel
 */

/**
 * @class
 */
export default class DataConnection extends EventEmitter {

	/**
	 * @param [id="Connection"] {string} Optional identifier for logging purposes
	 */
	constructor (id) {
		super();

		/**
		 * @type {string}
		 * @private
		 */
		this._id = id || 'DataConnection';
	}

	/**
	 *
	 * @param opts {CreateConnectionOptions}
	 * @returns {Connection}
	 */
	create (opts) {

		opts = Object.assing({
			sending: false,
			receiving: false
		}, opts || {});

		this._log('Using SCTP based data channels');

		// SCTP is supported from Chrome 31 and is supported in FF.
		// No need to pass DTLS constraint as it is on by default in Chrome 31.
		// For SCTP, reliable and ordered is true by default.

		/** @member {RTCPeerConnection} */
		this._connection = new RTCPeerConnection();

		/**
		 *
		 * @param e {RTCPeerConnectionIceEvent}
		 */
		this._connection.onicecandidate = e => this._onIceCandidate(e);

		if (opts.sending) {
			/** @member {RTCDataChannel} */
			this.sendChannel = this._connection.createDataChannel('sendDataChannel', null);
			this.sendChannel.onopen = () => this._onSendChannelStateChange();
			this.sendChannel.onclose = () => this._onSendChannelStateChange();
			this._log('Created send data channel');
		}

		if (opts.receiving) {
			/**
			 *
			 * @param e {RTCDataChannelEvent}
			 */
			this._connection.ondatachannel = e => this._receiveChannelCallback(e);
			this._log('Created receiving data channel');
		}

		this._log('Created peer connection object this._connection');

		return this;
	}

	/**
	 *
	 * @returns {Promise}
	 */
	createOffer () {
		return this._connection.createOffer().then(
			desc => {
				this._log('Emiting offer:\n' + desc.sdp);
				this.emit('offer', desc);
				return this._setLocalDescription(desc);
			}
		).catch(
			error => this._log('Failed to create session description: ' + error)
		);
	}

	/**
	 *
	 * @returns {Promise}
	 */
	createAnswer () {
		return this._connection.createAnswer().then(
			desc => {
				this._log('Emiting answer: \n' + desc.sdp);
				this.emit('answer', desc);
				return this._setLocalDescription(desc)
			}
		).catch(
			error => this._log('Failed to create session description: ' + error)
		);
	}

	/**
	 *
	 */
	sendData (data) {
		if (!this.sendChannel) throw new Error("Send channel was not created: check your init options");
		this.sendChannel.send(data);
		this._log('Sent Data: ' + data);
	}

	/**
	 *
	 */
	close () {

		this._log('Closing data channels');

		if (this.receiveChannel) {
			this.receiveChannel.close();
			this._log('Closed data channel with label: ' + this.receiveChannel.label);
			this.receiveChannel = null;
		}

		if (this.sendChannel) {
			this.sendChannel.close();
			this._log('Closed data channel with label: ' + this.sendChannel.label);
			this.sendChannel = null;
		}

		this._connection.close();
		this._connection = null;

		this._log('Closed peer connection');

	}

	/**
	 *
	 * @param desc {RTCSessionDescriptionInit}
	 * @returns {Promise}
	 * @private
	 */
	_setLocalDescription (desc) {
		return this._connection.setLocalDescription(desc);
	}

	/**
	 *
	 * @param desc {RTCSessionDescriptionInit}
	 * @returns {Promise}
	 * @private
	 */
	setRemoteDescription (desc) {
		return this._connection.setRemoteDescription(desc);
	}

	/**
	 * @param event {RTCPeerConnectionIceEvent}
	 * @returns {Promise}
	 * @private
	 */
	_onIceCandidate (event) {
		this._log( 'Emiting ice-candidate:\n' + (event.candidate ? event.candidate.candidate : '(null)'));
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
			this._log('Emiting message: ' + event.data);
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
		this._log('Emiting receiveChannel:readyState:changed: ' + readyState);
		this.emit('receiveChannel:readyState:changed', readyState);
	}

	/**
	 *
	 * @private
	 */
	_onSendChannelStateChange () {
		const readyState = this.sendChannel.readyState;
		this._log('Emiting sendChannel:readyState:changed: ' + readyState);
		this.emit('sendChannel:readyState:changed', readyState);
	}

	/** Print log message
	 *
	 * @param msg
	 * @private
	 */
	_log (...msg) {
		console.log('['+this._id+'] ', ...msg);
	}

	/**
	 *
	 * @param candidate {RTCIceCandidate}
	 * @returns {Promise}
	 */
	addIceCandidate (candidate) {
		return this._connection.addIceCandidate(candidate);
	}

}
