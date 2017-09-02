/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

import Main from './Main.class.js';

const main = window.main = new Main();

/** {Element} */
const dataChannelSend = document.querySelector('textarea#dataChannelSend');

/** {Element} */
const dataChannelReceive = document.querySelector('textarea#dataChannelReceive');

main.on('message', data => {
	dataChannelReceive.value = data;
});

/** {Element} */
const startButton = document.querySelector('button#startButton');
startButton.onclick = () => {
	dataChannelSend.placeholder = '';
	startButton.disabled = true;
	closeButton.disabled = false;
	return main.createConnection();
};

/** {Element} */
const sendButton = document.querySelector('button#sendButton');
sendButton.onclick = () => {
	const data = dataChannelSend.value;
	main.sendData(data);
};

/** {Element} */
const closeButton = document.querySelector('button#closeButton');
closeButton.onclick = () => {
	main.closeDataChannels();

	startButton.disabled = false;
	sendButton.disabled = true;
	closeButton.disabled = true;

	dataChannelSend.value = '';
	dataChannelSend.disabled = true;

	dataChannelReceive.value = '';
};

main.on('sendChannel:readyState:changed', readyState => {
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
