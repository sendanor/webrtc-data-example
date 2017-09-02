/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

import DataConnection from './DataConnection.class.js';

const localConnection = window.localConnection = new DataConnection('local');
const remoteConnection = window.remoteConnection = new DataConnection('remote');

/** {Element} */
const dataChannelSend = document.querySelector('textarea#dataChannelSend');

/** {Element} */
const dataChannelReceive = document.querySelector('textarea#dataChannelReceive');

remoteConnection.on('message', data => {
	dataChannelReceive.value = data;
});

/** {Element} */
const startButton = document.querySelector('button#startButton');
startButton.onclick = () => {

	dataChannelSend.placeholder = '';
	startButton.disabled = true;
	closeButton.disabled = false;

	localConnection.create({sending: true});

	remoteConnection.create({receiving: true});

	localConnection.once(
		'offer',
		desc => remoteConnection.setRemoteDescription(desc).then(
			() => remoteConnection.createAnswer()
		).catch(
			err => console.log('Failed to handle offer or create an answer: ' + err)
		)
	);

	remoteConnection.once('answer', desc => localConnection.setRemoteDescription(desc) );

	return localConnection.createOffer();
};

/** {Element} */
const sendButton = document.querySelector('button#sendButton');
sendButton.onclick = () => {
	const data = dataChannelSend.value;
	localConnection.sendData(data);
};

/** {Element} */
const closeButton = document.querySelector('button#closeButton');
closeButton.onclick = () => {
	localConnection.close();
	remoteConnection.close();

	startButton.disabled = false;
	sendButton.disabled = true;
	closeButton.disabled = true;

	dataChannelSend.value = '';
	dataChannelSend.disabled = true;

	dataChannelReceive.value = '';
};

localConnection.on('sendChannel:readyState:changed', readyState => {
	if (readyState === 'open') {
		dataChannelSend.disabled = false;
		dataChannelSend.focus();
		sendButton.disabled = false;
		closeButton.disabled = false;
	} else {
		dataChannelSend.disabled = true;
		sendButton.disabled = true;
		closeButton.disabled = true;
	}
});

localConnection.on(
	'ice-candidate',
	candidate => remoteConnection.addIceCandidate(candidate).then(
		() => console.log('AddIceCandidate success.')
	).catch(
		error => console.log('Failed to add Ice Candidate: ' + error)
	)
);

remoteConnection.on(
	'ice-candidate',
	candidate => localConnection.addIceCandidate(candidate).then(
		() => console.log('AddIceCandidate success.')
	).catch(
		error => console.log('Failed to add Ice Candidate: ' + error)
	)
);
