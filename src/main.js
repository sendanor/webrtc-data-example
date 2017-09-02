/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

import LocalMain from './LocalMain.class.js';
import RemoteMain from './RemoteMain.class.js';

const localMain = window.localMain = new LocalMain();
const remoteMain = window.remoteMain = new RemoteMain();

/** {Element} */
const dataChannelSend = document.querySelector('textarea#dataChannelSend');

/** {Element} */
const dataChannelReceive = document.querySelector('textarea#dataChannelReceive');

remoteMain.on('message', data => {
	dataChannelReceive.value = data;
});

/** {Element} */
const startButton = document.querySelector('button#startButton');
startButton.onclick = () => {

	dataChannelSend.placeholder = '';
	startButton.disabled = true;
	closeButton.disabled = false;

	localMain.createConnection();

	remoteMain.createConnection();

	localMain.once(
		'offer',
		desc => remoteMain.setRemoteDescription(desc).then(
			() => remoteMain.createAnswer()
		).catch(
			err => console.log('Failed to handle offer or create an answer: ' + err)
		)
	);

	remoteMain.once('answer', desc => localMain.setRemoteDescription(desc) );

	return localMain.createOffer();
};

/** {Element} */
const sendButton = document.querySelector('button#sendButton');
sendButton.onclick = () => {
	const data = dataChannelSend.value;
	localMain.sendData(data);
};

/** {Element} */
const closeButton = document.querySelector('button#closeButton');
closeButton.onclick = () => {
	localMain.close();
	remoteMain.close();

	startButton.disabled = false;
	sendButton.disabled = true;
	closeButton.disabled = true;

	dataChannelSend.value = '';
	dataChannelSend.disabled = true;

	dataChannelReceive.value = '';
};

localMain.on('sendChannel:readyState:changed', readyState => {
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

localMain.on(
	'ice-candidate',
	candidate => remoteMain.addIceCandidate(candidate).then(
		() => console.log('AddIceCandidate success.')
	).catch(
		error => console.log('Failed to add Ice Candidate: ' + error)
	)
);

remoteMain.on(
	'ice-candidate',
	candidate => localMain.addIceCandidate(candidate).then(
		() => console.log('AddIceCandidate success.')
	).catch(
		error => console.log('Failed to add Ice Candidate: ' + error)
	)
);
