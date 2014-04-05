/*
etsyStar.js
v0.1
http://ifelse.org/projects/etsy/favorites/index.html

Michael Donohoe
http://ifelse.org

Thank you YQL!

You need to have the Prototype library available or this will do absolutely nothing. Which is bad.
(Bad = !Good || Woeful)

http://www.prototypejs.org/download
(Google host a copy here: http://ajax.googleapis.com/ajax/libs/prototype/1.6.0.2/prototype.js)

Its worth noting that it would be kinda lame to have the Prototype Libray for just this script.
If you're in that pickle then get in touch and I'll update it to work without that.

Feeback, suggestions, abuse, unmarked bills in dollars or euros welcome.
*/
function EtsyStar(params) {
	var App = {
	    run: function(params) {

	        this.Users     = params.Users    || [];// ['donohoe', 'klittle212']; // Etsy usernames go here... no limit but be reasonable
	        this.Limit     = params.Limit    || 3;//'3';     // This is limit for user, with 0 = all results returned
	        this.ListType  = params.ListType || 'wide'; // thumbnail, wide, large, none (empty quotes == none)
	        this.Target    = params.Target   || 'etsyStar';

	        this.template  = params.Template || '<li><a class="thumbnail" title="#{title}" href="#{link}">#{image}</a><h3><a title="#{title}" href="#{link}">#{title}</a></h3><div class="price">#{price}</div><div class="seller"><a href="http://www.etsy.com/shop/#{seller}" title="Go to Shop">#{seller}</a></div></li>';
	        this.place     = $(this.Target);
	        this.place.addClassName(this.ListType);

	        var self       = this;
	        this.Users.each(function(user) {
	            var yqlUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D'http%3A%2F%2Fwww.etsy.com%2Fpeople%2F" + user + "%2Ffavorites%2Fitems.rss'%20" + ((self.Limit>0) ? ("limit%20" + self.Limit) : "") + "&format=json&callback=EtsyStarCallback";
	            self.loadJSON(yqlUrl);
	        });

	    },
	    loadJSON: function (url) {
	        this.timeoutId = setTimeout(function () {
	            this.scriptElm.remove();
	        }.bind(this), 2345);
	        this.scriptElm = $$('head')[0].appendChild(new Element('script', {
	            'id': 'yqljson',
	            'src': url
	        }));
	    },
	    draw: function(data) {
	        if (!data) { return; }

	        var self   = this;
	        var html   = (this.Users.length>1) ? this.place.innerHTML : '';
	        var LI     = new Template(this.template);

	        data.query.results.item.each(function(item) {
	            var temp = new Element('div').update(item.description);
	            var ps   = temp.select('p');
	            if (ps) {
	                var title        = item.title;
	                var sellerPos    = title.lastIndexOf(' by ');
	                item.title       = title.slice(0, sellerPos);
	                item.seller      = title.slice(sellerPos+4);
	                item.image       = self.getImage(ps[0]);
	                item.price       = (ps[1]) ? ps[1].innerHTML : '';
	                item.description = (ps[2]) ? ps[2].innerHTML : '';
	                html            += LI.evaluate(item);
	            }
	        });
	        this.place.update('<ul>' + html + '</ul>');
	    },
	    getImage: function(elm) {
	        var img;
	        if (!elm || !(img = elm.select('img')[0].src)) {
	            this.ListType = '';
	        }

	        switch (this.ListType) {
	        case "thumbnail":
	            img = img.replace("155x125", "75x75");
	            break;
	        case "wide":
	        //  Stop! You're perfect as you are!
	            break;
	        case "large":
	            img = img.replace("155x125", "430xN");
	            break;
	        case "":
	            img = '';
	        default:
	            if (!(img.indexOf(".jpg")>-1)) {
	                img = '';
	            }
	        }

	        return (img!='') ? '<img src="' + img + '"/>': '';
	    }
	};

	this.callback= function(data) {
		App.draw(data);
	};

	App.run(params);
};

var gallery = new EtsyStar({
	Users    : ['donohoe', 'klittle212'], // Etsy usernames go here... no limit but be reasonable
	Limit    :  '3',     // This is limit for user, with 0 = all results returned
	ListType :  'wide', // thumbnail, wide, large, none (empty quotes == none)
	Target   :  'etsyStar',
	Template :  false
});

function EtsyStarCallback(data) {
	if (gallery) return;
    gallery.callback(data);
}

/* I'm still angry at the writers for awful ending of BSG which was otherwise an outstanding series */
