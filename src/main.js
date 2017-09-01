/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

// We use jsdoc comments here to make WebStorm understand WebRTC API

/**
 * @name RTCSessionDescriptionInit
 * @class
 */

/**
 * @name RTCSessionDescriptionInit#sdp
 * @member {string}
 */

/**
 * @name RTCSessionDescription
 * @class
 */

/**
 * @name RTCDataChannelInit
 * @class
 */

/**
 * @name RTCOfferOptions
 * @class
 */

/**
 * @name RTCIceCandidate
 * @class
 */

/**
 * @name RTCIceCandidate#candidate
 * @member {string}
 */

/**
 * @name RTCDataChannelEvent
 * @class
 */

/**
 * @name RTCDataChannelEvent#channel
 * @member {RTCDataChannel}
 */

/**
 * @name RTCPeerConnectionIceEvent
 * @class
 */

/**
 * @name RTCPeerConnectionIceEvent#candidate
 * @member {RTCIceCandidate}
 */

/**
 * @name RTCDataChannel
 * @class
 */

/**
 * @method
 * @name RTCDataChannel#send
 * @param {string|Blob|ArrayBuffer|ArrayBufferView} data
 */

/**
 * @method
 * @name RTCDataChannel#close
 */

/**
 * @name RTCAnswerOptions
 * @class
 */

/**
 * @name RTCIceCandidateInit
 * @class
 */

/**
 * @name RTCPeerConnection
 * @class
 */

/**
 * @method
 * @name RTCPeerConnection#setLocalDescription
 * @param {RTCSessionDescriptionInit|RTCSessionDescription} sessionDescription
 * @returns {Promise}
 */

/**
 * @method
 * @name RTCPeerConnection#setRemoteDescription
 * @param {RTCSessionDescriptionInit|RTCSessionDescription} sessionDescription
 * @returns {Promise}
 */

/**
 * @method
 * @name RTCPeerConnection#createDataChannel
 * @param {string} label
 * @param {RTCDataChannelInit} [options]
 * @returns {RTCDataChannel}
 */

/**
 * @method
 * @name RTCPeerConnection#createOffer
 * @param {RTCOfferOptions} [options]
 * @returns {Promise.<RTCSessionDescriptionInit>}
 */

/**
 * @method
 * @name RTCPeerConnection#createAnswer
 * @param {RTCAnswerOptions} [options]
 * @returns {Promise.<RTCSessionDescriptionInit>}
 */

/**
 * @method
 * @name RTCPeerConnection#addIceCandidate
 * @param {RTCIceCandidateInit|RTCIceCandidate} candidate
 * @returns {Promise}
 */

/**
 * @method
 * @name RTCPeerConnection#close
 */

/** Print log message
 *
 * @param msg
 */
function log (msg) {
	console.log(msg);
}

/**
 * @class
 */
class Main {

	constructor () {

		/** @member {Element} */
		this.dataChannelSend = document.querySelector('textarea#dataChannelSend');

		/** @member {Element} */
		this.dataChannelReceive = document.querySelector('textarea#dataChannelReceive');

		/** @member {Element} */
		this.startButton = document.querySelector('button#startButton');

		/** @member {Element} */
		this.sendButton = document.querySelector('button#sendButton');

		/** @member {Element} */
		this.closeButton = document.querySelector('button#closeButton');

		this.startButton.onclick = this.createConnection.bind(this);
		this.sendButton.onclick = this.sendData.bind(this);
		this.closeButton.onclick = this.closeDataChannels.bind(this);

	}

	/**
	 * @returns {Promise}
	 */
	createConnection () {

		this.dataChannelSend.placeholder = '';

		this.servers = null;
		this.pcConstraint = null;
		this.dataConstraint = null;

		log('Using SCTP based data channels');

		// SCTP is supported from Chrome 31 and is supported in FF.
		// No need to pass DTLS constraint as it is on by default in Chrome 31.
		// For SCTP, reliable and ordered is true by default.
		// Add localConnection to global scope to make it visible
		// from the browser console.

		/** @member {RTCPeerConnection} */
		this.localConnection = new RTCPeerConnection(this.servers, this.pcConstraint);

		log('Created local peer connection object this.localConnection');

		/** @member {RTCDataChannel} */
		this.sendChannel = this.localConnection.createDataChannel('sendDataChannel', this.dataConstraint);

		log('Created send data channel');

		/**
		 *
		 * @param e {RTCPeerConnectionIceEvent}
		 */
		this.localConnection.onicecandidate = e => this.onIceCandidate(this.localConnection, e);

		this.sendChannel.onopen = () => this.onSendChannelStateChange();
		this.sendChannel.onclose = () => this.onSendChannelStateChange();

		/** @member {RTCPeerConnection} */
		this.remoteConnection = new RTCPeerConnection(this.servers, this.pcConstraint);

		/**
		 *
		 * @param e {RTCPeerConnectionIceEvent}
		 */
		this.remoteConnection.onicecandidate = e => this.onIceCandidate(this.remoteConnection, e);

		/**
		 *
		 * @param e {RTCDataChannelEvent}
		 */
		this.remoteConnection.ondatachannel = e => this.receiveChannelCallback(e);

		log('Created remote peer connection object this.remoteConnection');

		this.startButton.disabled = true;
		this.closeButton.disabled = false;

		return this.localConnection.createOffer().then(
			desc => this.gotDescription1(desc),
			error => log('Failed to create session description: ' + error)
		);
	}

	/**
	 *
	 */
	sendData () {
		const data = this.dataChannelSend.value;
		this.sendChannel.send(data);
		log('Sent Data: ' + data);
	}

	/**
	 *
	 */
	closeDataChannels () {

		log('Closing data channels');

		this.sendChannel.close();

		log('Closed data channel with label: ' + this.sendChannel.label);

		this.receiveChannel.close();

		log('Closed data channel with label: ' + this.receiveChannel.label);

		this.localConnection.close();
		this.remoteConnection.close();
		this.localConnection = null;
		this.remoteConnection = null;

		log('Closed peer connections');

		this.startButton.disabled = false;
		this.sendButton.disabled = true;
		this.closeButton.disabled = true;
		this.dataChannelSend.value = '';
		this.dataChannelReceive.value = '';
		this.dataChannelSend.disabled = true;

		this.sendButton.disabled = true;
		this.startButton.disabled = false;
	}

	/**
	 *
	 * @param desc {RTCSessionDescriptionInit}
	 * @returns {Promise}
	 */
	gotDescription1 (desc) {
		return this.localConnection.setLocalDescription(desc).then(
			() => log('Offer from this.localConnection \n' + desc.sdp)
		).then(
			() => this.remoteConnection.setRemoteDescription(desc)
		).then(
			() => this.remoteConnection.createAnswer()
		).then(
			desc => this.gotDescription2(desc)
		).catch(
			error => log('Failed to create session description: ' + error)
		);
	}

	/**
	 *
	 * @param desc {RTCSessionDescriptionInit}
	 * @returns {Promise}
	 */
	gotDescription2 (desc) {
		return this.remoteConnection.setLocalDescription(desc).then(
			() => log('Answer from this.remoteConnection \n' + desc.sdp)
		).then(
			() => this.localConnection.setRemoteDescription(desc)
		);
	}

	/**
	 *
	 * @param pc {RTCPeerConnection}
	 * @returns {RTCPeerConnection}
	 */
	getOtherPc (pc) {
		return (pc === this.localConnection) ? this.remoteConnection : this.localConnection;
	}

	/**
	 *
	 * @param pc {RTCPeerConnection}
	 * @returns {string}
	 */
	getName (pc) {
		return (pc === this.localConnection) ? 'localPeerConnection' : 'remotePeerConnection';
	}

	/**
	 * @param pc {RTCPeerConnection}
	 * @param event {RTCPeerConnectionIceEvent}
	 * @returns {Promise}
	 */
	onIceCandidate (pc, event) {

		log( this.getName(pc) + ' ICE candidate: \n' + (event.candidate ? event.candidate.candidate : '(null)'));

		return this.getOtherPc(pc).addIceCandidate(event.candidate).then(
			() => log('AddIceCandidate success.'),
			error => log('Failed to add Ice Candidate: ' + error)
		);
	}

	/**
	 *
	 * @param event {RTCDataChannelEvent}
	 */
	receiveChannelCallback (event) {

		log('Receive Channel Callback');

		/** @member {RTCDataChannel} */
		this.receiveChannel = event.channel;

		/**
		 *
		 * @param event {MessageEvent}
		 */
		this.receiveChannel.onmessage = event => {
			log('Received Message');
			this.dataChannelReceive.value = event.data;
		};

		this.receiveChannel.onopen = () => this.onReceiveChannelStateChange();

		this.receiveChannel.onclose = () => this.onReceiveChannelStateChange();
	}

	/**
	 *
	 */
	onSendChannelStateChange () {
		const readyState = this.sendChannel.readyState;
		log('Send channel state is: ' + readyState);
		if (readyState === 'open') {
			this.dataChannelSend.disabled = false;
			this.dataChannelSend.focus();
			this.sendButton.disabled = false;
			this.closeButton.disabled = false;
		} else {
			this.dataChannelSend.disabled = true;
			this.sendButton.disabled = true;
			this.closeButton.disabled = true;
		}
	}

	/**
	 *
	 */
	onReceiveChannelStateChange () {
		const readyState = this.receiveChannel.readyState;
		log('Receive channel state is: ' + readyState);
	}

}

window.main = new Main();