// ==UserScript==
// @name			Loop YouTube Video
// @description		Adds a Loop button that lets you auto-repeat a YouTube video.
// @namespace		loop-youtube-video-c
// @include			http://youtube.com/watch?v=*
// @include			http://*.youtube.com/watch?v=*
// @match			http://youtube.com/watch?v=*
// @match			http://*.youtube.com/watch?v=*
// @version			2.0
// ==/UserScript==

// Make sure we're actually on a video page!
if (!document.getElementById('watch-like-dislike-buttons'))
	return;
	
// Add the button to toggle whether we're looping.
var button = document.createElement('span');
button.innerHTML = 
	'<button \
		id="watch-loop" \
		class="yt-uix-button yt-uix-button-text yt-uix-tooltip" \
		type="button" \
		title="Loop this video" \
		data-orientation="vertical" \
		data-position="bottomright" \
		data-button-toggle="true" \
		data-tooltip-text="Loop this video" \
		role="button"> \
			<span class="yt-uix-button-content">Loop </span> \
	</button>';
document.getElementById('watch-like-dislike-buttons').appendChild(button);

// Injects code into the global scope.
function inject(fn) {
	var script = document.createElement('script');
	script.innerHTML = '(' + fn.toString() + ')();';
	document.body.appendChild(script);
}

// This function listens for the video ending and restarts it if we're looping. Inject
// it into the page. Note that we can't access any variables outside the function here.
inject(function () {

	// Controls whether we're looping.
	var looping = false;
	
	// Listen for the button click.
	document.getElementById('watch-loop').onclick = function () {
		looping = !looping;
		
		// Update all the UI
		if (looping) {
			this.setAttribute('data-tooltip-text', 'Turn off looping');
			this.style.color = '#932720';
		} else {
			this.setAttribute('data-tooltip-text', 'Loop this video');
			this.style.color = '';
		}
	};
		
	// Returns the player API interface or false if it's not ready.
	function getPlayer() {
		return window.yt.player 
			&& window.yt.player.getPlayerByElement
			&& window.yt.player.getPlayerByElement(document.getElementById('player-api'));
	}
		
	// Listen for the end of the video.
	function attach() {
		var player = getPlayer();
		player.addEventListener('onStateChange', function (state) {
			if (state == '0' && looping)
				player.playVideo();
		});
	}

	// Wait until the YouTube API's ready.
	function wait() {
		setTimeout(getPlayer() ? attach : wait, 100);
	}
	
	wait();
});