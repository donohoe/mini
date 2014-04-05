/*
Elephants make Javascript 3% faster
@donohoe
*/
var Pictures = {
    init: function(){
        var instance = this;
        this.config();
        this.loading(function(data){
            instance.build(data);
            instance.updateInfo(0);
            $('meta').style.display = 'block';
            $('meta').focus();
        });
    },

    config: function() {
        var instance  = this;
        var container = $('container');
        var controls  = $('controls');
        var wrapper   = $('wrapper');
        var meta      = $('meta');
        this.empty    = 'img/px.gif';

        this.Slides         = {};
        this.Slides.Index   = [];
        this.Slides.Current = 0;

        var isIphone  = (/iphone/gi).test(navigator.appVersion),
            isIpad    = (/ipad/gi).test(navigator.appVersion),
            isAndroid = (/android/gi).test(navigator.appVersion);

        if (isIphone) {
            setTimeout(function(){ window.scrollTo(0, 1); }, 500);
        }

        this.isTouch  = isIphone || isIpad || isAndroid;
        this.isWebkit = RegExp(" AppleWebKit/").test(navigator.userAgent);
        this.resize();

        if (this.isTouch) {
            $('prev').style.display = 'none';
            $('next').style.display = 'none';
            this.swipeStarted = false;
            this.swipeLength  = 120;
            this.swipeStartX  = 0;
            this.swipeTarget  = '';

            document.title = 'Pictures';
            document.addEventListener("touchmove",  function(e) {e.preventDefault(); }, false);
            document.addEventListener('touchstart', this.swipeStart, false);
            document.addEventListener('touchmove',  this.swipeMove,  false);

            if (isIpad || isIphone) { // Startup screen
                var h = document.getElementsByTagName("head")[0];
                var l = document.createElement('link');
                l.rel = 'apple-touch-startup-image';
                l.href = 'img/apple/startup/' + ((isIpad) ? 'ipad' : 'iphone') + '.png';
                h.appendChild(l);
            }
        } else {
            window.addEventListener('keydown',  this.keyCheck,    false);
        }

        wrapper.addEventListener('click',  this.clickButton, false);
        window.addEventListener('click',   this.switchViews, false);
        window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', this.resize, false);

        container.addEventListener('webkitAnimationEnd' in window ? 'webkitAnimationEnd' : 'transitionend', function(e) {
            instance.manager(instance.Slides.Current);
        }, false);

    //  Remember
        var view = _gC('pictures');
        if (view==null) {
            _sC('pictures', 'full', '', '/', '', '' );
        } else if (view=='minimal') {
            wrapper.setAttribute('class', 'minimal');
        }

    //  Hacks, for smaller screens (move to CSS)
        if (window.innerWidth<700) {
            meta.setAttribute('class', 'istiny');
            container.setAttribute('class', 'istiny');
        }
    },

    resize: function() {
        var instance    = Pictures;
        var container   = $('container');

        instance.Width  = window.innerWidth;
        instance.Height = window.innerHeight;

        container.style.width  = instance.Width  + 'px';
        container.style.height = instance.Height + 'px';
    },

    loading: function(cb) {

		var ajaxRequest;  // The variable that makes Ajax possible!

		try{
			// Opera 8.0+, Firefox, Safari
			ajaxRequest = new XMLHttpRequest();
		} catch (e){
			// Internet Explorer Browsers
			try{
				ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try{
					ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e){
					// Something went wrong
					alert("Your browser broke!");
					return false;
				}
			}
		}
		// Create a function that will receive data sent from the server
		ajaxRequest.onreadystatechange = function(){
			if(ajaxRequest.readyState == 4){
				cb(ajaxRequest.responseText);
			}
		}


		ajaxRequest.open("GET", "/svc/slides/slides.js", true);
		ajaxRequest.send(null);

    },

    build: function(data) {
        var slides = eval(data);
        var len    = slides.length;
        var html   = '';
        var count  = 0;
        var size   = (window.innerWidth<500) ? 'XLarge' : 'Jumbo';

        for (var i=0; i<len; i++) {

            var slide  = slides[i];
            var media  = slide.media;

            if (slide.section!='Opinion' && slide.section!='Sports') {

                var ns = {}; // New Slide
                var id = this.safeTxt(slide.url);

                ns.title     = slide.title     || '';
                ns.byline    = slide.byline    || '';
                ns.created   = slide.created   || '';
                ns.summary   = slide.summary   || '';
                ns.url       = slide.url;
                ns.related   = slide.related   || '';
                ns.section   = slide.section   || '';

                ns.caption   = media.caption   || slide.title;
                ns.copyright = media.copyright || '';
                ns.src       = media.large;
                ns.height    = media.height || '';
                ns.width     = media.width  || '' ;
                ns.thumb     = media.thumbnail;

                ns.domID     = id;
                ns.loaded    = false;

                var src      = this.empty;

                if (count<5) {
                    ns.loaded = true;
                    src = ns.src;
                }

                this.Slides[id] = ns;
                this.Slides.Index.push(id);

                html += "<div class='page' style='left: " + ((count==0) ? "0px" : "100%") + "; width: 100%'>";
				html += "<img src='" + src + "' style='" + ((ns.height>ns.width) ? "height" : "width") + ":100%'/>";
                html += "</div>";

                count++;

            }
        }
        $('container').innerHTML = html;
    },

//  NEXT PAGE

    moveSlide: function(dir) {
        var instance  = Pictures;
        var dir       = dir || 'next';
        var cs        = $('container');
        var pages     = $$('page');

        var viewSlide = 0;
        var numSlides = instance.Slides.Index.length;
        var currSlide = instance.Slides.Current || 0;

        if (dir=='next') {
            viewSlide = (currSlide+1>=numSlides) ? currSlide : currSlide + 1;
        } else {
            viewSlide = (currSlide-1 < 0) ? currSlide : currSlide-1;
        }

        if (currSlide==viewSlide) { return; }
        $('metaInfo').style.opacity = 0;

        pages[viewSlide].setAttribute('style', 'width: 100%; left: 0%;');
        pages[currSlide].setAttribute('style', 'width: 100%; left: ' + ((dir=='next') ? '-' : '') + '100%;');

        setTimeout(function(){
            instance.manager(viewSlide);
            instance.updateInfo(viewSlide);
        }, 504); // and wait for animation to end

        instance.Slides.Current = viewSlide;

    //  Toggle control view (but only if we're near the start or end of a show)
        if (!instance.isTouch) {
            if (viewSlide < 2 || viewSlide > (numSlides-3)) {
                $('prev').style.display = (viewSlide==0)             ? 'none' : 'block';
                $('next').style.display = (viewSlide==(numSlides-1)) ? 'none' : 'block';
            }
        }
    },

    manager: function(index) {
        var instance  = Pictures;
        var numSlides = instance.Slides.Index.length;

        if (numSlides > 4) {

            var pages = $$('page');
            var start = ((index-2) < 0)           ? 0             : index-2;
            var end   = ((index+2) > numSlides-1) ? (numSlides-1) : index+2;

            for (var i=0; i<numSlides; i++) {
                var img = pages[i].getElementsByTagName('img')[0];
                var cmp = img.src.indexOf(instance.empty);

                if (i>=start && i <= end) {
                    if (cmp>0) {
                        img.src  = instance.Slides[instance.Slides.Index[i]].src;
						img.onload = function() {
						    console.log('image loaded', img.src);
						};
                    }
                } else {
                    if (cmp<0) {
                        img.src  = instance.empty;
                    }
                }

            }
        }
    },

    updateInfo: function(index) {
        var i = Pictures;
        var s = i.Slides[i.Slides.Index[index]];

        $('metaInfo').innerHTML = "<p class='credit'>" + ((s.copyright=="") ? "" : "<i>Credit:</i> " + s.copyright) + "</p><p class='caption'>" + s.caption + "<a href='" + s.url + "' title='" + s.title + "'>Go to article &raquo;</a></p>";
        $('metaInfo').style.opacity = 1;
    },

//  Navigation

    clickButton: function(e) {
        var elm = e.target;
        if (elm.nodeName=='SPAN') {
            if (elm.id=="next" || elm.id=="prev") {
                Pictures.moveSlide(elm.id);
            }
            if (elm.id=="info" || elm.id=="close") {
                Pictures.switchAbout(elm.id);
            }
        }
    },

    keyCheck: function(e) {
        var i = Pictures;
        var k = e.keyCode;
        var p = false;
console.log(k);
        switch(k) {
            case 37:  // Left
            case 90:  // z
            case 188: // ,
                i.moveSlide('prev');
                p = true;
                break;
            case 32:  // Space
            case 39:  // Right
            case 88:  // x
            case 190: // .
                i.moveSlide('next');
                p = true;
                break;
            case 16: // Shift
            case 38: // Up
            case 40: // Down
                i.switchViews(e);
                p = true;
                break;
            case 13: // Enter
            case 65: // a
                i.followLink();
                break;
            case 73: // i
                i.showInfo();
                break;
            case 27: // Escape
                $('wrapper').setAttribute('class', '');
                break;
        }
        if (p) e.preventDefault();
    },

    swipeStart: function(e) {
        var instance = Pictures;
        instance.swipeStartX  = e.touches[0].pageX;
        instance.swipeStarted = true;
        instance.swipeTarget  = e.touches[0].target;
    },

    swipeMove: function(e) {
        var instance = Pictures;
        var diffX    = (e.touches[0].pageX - instance.swipeStartX);
        if (instance.swipeStarted && (diffX > instance.swipeLength || diffX < -instance.swipeLength)) {
            instance.swipeStarted = false;
            if (diffX > instance.swipeLength) {
                instance.moveSlide('prev');
            } else {
                instance.moveSlide('next');
            }
        }
    },

//  Views

    switchAbout: function(e) {
        var e = $('wrapper');
        var c = e.getAttribute('class');
        if (c.indexOf('about')>-1) {
            e.setAttribute('class', '');
        } else {
            e.setAttribute('class', 'about');
        }
    },

    switchViews: function(e) {
        var elm = e.target;
        if (elm.nodeName!='SPAN' && elm.nodeName!='A' && elm.id!='about') {
            var c = $('wrapper');
            var k = 'minimal';
            if (c.getAttribute('class').indexOf('minimal')>-1) { k = ''; }
            c.setAttribute('class', k);
            _sC('pictures', k, '', '/', '', '');
        }
    },

    followLink: function() {
        var link = $('metaInfo').getElementsByTagName('a')[0];
        if (link) {
            location.href = link.href + "?pagewanted=all#slides";
        }
    },

//  HELPERS

    safeTxt: function(url) {
    //  For use as safe page ID in DOM
        if (url) {
            var tmp = url.substr(0, (url.indexOf('.nytimes.com/')+13));
            url = url.replace(tmp, '');
            url = url.replace('.html', '');
            url = url.replace('.jpg', '');
            url = url.replace('.png', '');
            url = url.toLowerCase().replace(/\//g, '_');
            url = url.split("?")[0];
        }
        return url;
    }
};

document.addEventListener('DOMContentLoaded', function(){
    Pictures.init();
}, false);
