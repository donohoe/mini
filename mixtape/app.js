var Cassette = {

	title: document.title,
	player:  null,
	thePlayList: false,
	theIndex:    false,

	init: function() {
		var tag = document.createElement('script');
		tag.src = "http://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		document.getElementById("ctrls").addEventListener("click", this.evtClick, false);
		document.getElementById("artist").addEventListener("click", function(){
			$("#btn-stop").trigger('click');
		}, false);
	},

	evtClick: function(event) {
		var self = Cassette;
		var delay = 800;
		var action = event.target.getAttribute("data-ctrl");
		document.title = Cassette.title;
		switch (action) {
			case "play":
				self.playVideo();
				break;
			case "stop":
				self.stopVideo();
				break;
			case "rew":
				self.skipToPreviousTrack();
				setTimeout(function() {
					self.clearActiveButton();
					self.setActiveButton(document.getElementById("btn-play"));
					self.setWheelAnimation("play");
				}, 1200);
				break;
			case "fwd":
				self.skipToNextTrack();
				setTimeout(function() {
					self.clearActiveButton();
					self.setActiveButton(document.getElementById("btn-play"));
					self.setWheelAnimation("play");
				}, 1200);
				break;
			default:
		}

		self.setActiveButton(event.target);
		self.setWheelAnimation(action);
	},

	onYouTubeIframeAPIReady: function () {
		var that = this;

	//	Play video or Playlist

		this.vid = false;
		var hash = location.hash.replace("#", "") || "";
		if (hash.length>8 && hash.length < 16) {
			this.vid = hash.replace("/", "");
		}

		if (this.vid==false) {
			this.loadPlayList(function(list) {
				if (!list || list.length==0) {
					list = [{id:"_YCGtT_FRYg"}, {id:"_SoWRCy21pY"}];
				}
				that.thePlayList = list;
				that.theIndex = 0;
				that.prepToPlay(that.thePlayList[that.theIndex]);
				that.setActiveButton(document.getElementById("btn-play"));
			});
		} else {
			this.loadVideo(function(list) {
				if (!list || list.length==0) {
					console.log('list is empty');
				}
				that.thePlayList = list;
				that.theIndex = 0;
				that.prepToPlay(that.thePlayList[that.theIndex]);
				that.setActiveButton(document.getElementById("btn-play"));
			});
			
		}


	},

	prepToPlay: function (item) {
		var self = Cassette;
		var id = item.id;

		self.updateTrackName(item);

		var callback = function() {
			self.playVideo(); 
			self.setWheelAnimation("play") 
		};
		Cassette.player = new YT.Player('player', {
			height:  '195',
			width:   '300',
			videoId:  id,
			events: {
				'onReady':       callback,
				'onStateChange': self.onPlayerStateChange
			}
		});
	},

	loadPlayList: function(callback) {
		var that = this;
		var playListURL = 'http://gdata.youtube.com/feeds/api/playlists/PLbb8argPHCOsbVytetHllUs90ELMVwdor?v=2&alt=json&callback=?';
		var videoURL = 'http://www.youtube.com/watch?v=';

		$.getJSON(playListURL, function(data) {
		    var list=[];
		    $.each(data.feed.entry, function(i, item) {
				var video = {};
				var link = item.link[1].href;
				var f = link.split("/");
				video.title = item.title.$t;
				video.id = f[f.length - 2];
				video.url = "http://www.youtube.com/watch?v=" + video.id;
				if (video.id.indexOf("www")<0) {
					list[list.length] = video;
				}
		    });
			if (callback) { 
				list = list.sort( function() { return (Math.round(Math.random())-0.5); } );
				callback(list);
			}
		});
	},

	loadVideo: function(callback) {
		var that = this;
		var videoURL = "http://gdata.youtube.com/feeds/api/videos/" + this.vid + "?v=2&alt=json&callback=?";
		$.getJSON(videoURL, function(data) {
		    var list=[];
			var item = data.entry;
			var video = {};
			var link = item.link[1].href;
			var f = link.split("/");
			video.title = item.title.$t;
			video.id = f[f.length - 2];
			video.url = "http://www.youtube.com/watch?v=" + video.id;
			if (video.id.indexOf("www")<0) {
				list[list.length] = video;
			}
			if (callback) {
				callback(list);
			}
		});
	},

	playVideo: function (event) {
		document.title = document.getElementById("btn-play").innerText + " " + Cassette.title;
		Cassette.player.playVideo();
	},

	onPlayerStateChange: function (event) {
		var self = Cassette;
		if (event.data == YT.PlayerState.ENDED) {
			self.theIndex++;
			if (self.theIndex == self.thePlayList.length) {
				self.theIndex = 0;
			}
			var item = self.thePlayList[self.theIndex];
			Cassette.updateTrackName(item);
			Cassette.player.loadVideoById(item.id, 0, "large");
		}
	},

	skipToPreviousTrack: function() {
		var prevTrack = this.theIndex - 1;
		if (prevTrack < 0) {
			prevTrack = this.thePlayList.length - 1;
		}
		this.theIndex = prevTrack;
		var item = this.thePlayList[prevTrack];
		Cassette.updateTrackName(item);
		Cassette.player.loadVideoById(item.id, 0, "large");
	},

	skipToNextTrack: function() {
		var nextTrack = this.theIndex + 1;
		if (nextTrack == this.thePlayList.length) {
			nextTrack = 0;
		}
		this.theIndex = nextTrack;
		var item = this.thePlayList[nextTrack];
		Cassette.updateTrackName(item);
		Cassette.player.loadVideoById(this.thePlayList[nextTrack].id, 0, "large");
	},

	stopVideo: function() {
		Cassette.player.stopVideo();
	},

	updateTrackName: function(item) {
		var a = document.getElementById("artist");
		a.innerText = item.title || "Track";
		a.href = "http://youtube.com/watch?v=" + item.id;
	},
	
	setActiveButton	: function(el) {
		this.clearActiveButton();
		el.className = el.className + " control-active"; // control-pressed
	},

	clearActiveButton: function() {
		var btns = document.querySelectorAll("#ctrls li");;
		var len = btns.length;
		for (var i=0; i<len; i++) {
			btns[i].className = btns[i].className.replace("control-active", "");
		}
	},

	setWheelAnimation: function(mode) {

		var self  = this;
		var anim  = '';
		var speed = (mode=="fwd" || mode == "rew") ? "1s" : "2s";

		if( mode === 'play' || mode === 'fwd' ) {
			anim = 'rotateRight';
		} else if (mode === 'rew' ) {
			anim = 'rotateLeft';
		}

		var style = { 
			'-webkit-animation'	: anim + ' ' + speed + ' linear infinite forwards',
			'-moz-animation'	: anim + ' ' + speed + ' linear infinite forwards',
			'-o-animation'		: anim + ' ' + speed + ' linear infinite forwards',
			'-ms-animation'		: anim + ' ' + speed + ' linear infinite forwards',
			'animation'			: anim + ' ' + speed + ' linear infinite forwards'
		};

		setTimeout( function() {
			$(".tape-wheel-left").css(style);
			$(".tape-wheel-right").css(style);
		}, 0);
	},

	resetWheels: function() {
		if (Cassette.player.getPlayerState()==1) {
			this.setWheelAnimation("play");
		} else {
			this.stopWheels();
		}
	},

	stopWheels: function() {
		var style = {
			'-webkit-animation'	: 'none',
			'-moz-animation'	: 'none',
			'-o-animation'		: 'none',
			'-ms-animation'		: 'none',
			'animation'			: 'none'
		}
		$(".tape-wheel-left").css(style);
		$(".tape-wheel-right").css(style);
	}
};

function onYouTubeIframeAPIReady() {
	Cassette.onYouTubeIframeAPIReady();
}