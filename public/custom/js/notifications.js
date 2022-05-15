
// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
	if (!Notification) {
		alert('Masaustu bildirimleri tarayicinizda calismiyor.');
		return;
	}

	if (Notification.permission !== 'granted')
		Notification.requestPermission();
});

function notifyMe(title, icon, body, onclickurl) {
	if (Notification.permission !== 'granted')
		Notification.requestPermission();
	else {
		var notification = new Notification(title, {
			icon: icon,
			body: body,
		});
		notification.onclick = function () {
			window.open(onclickurl);
		};
	}
}



var socket = io.connect(window.location.origin, {
	withCredentials: true,
	autoConnect: 10000
});

// function sendmsg(msg) {
// 	socket.emit('notification', {
// 		message: msg
// 	})
// }

socket.on('notification', data => {
	console.log(data)
	notifyMe(data.title,
		data.icon,
		data.body,
		data.onclickurl)
})