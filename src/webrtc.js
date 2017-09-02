/*
 *  Copyright (c) 2017 Jaakko-Heikki Heusala <jheusala@iki.fi>
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
const RTCPeerConnection = window.RTCPeerConnection;

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

// Exports
export {
	RTCPeerConnection
};
