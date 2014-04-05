var App = {
	init: function() {
		$("#search").focus().bind('keyup', this.suggest);
		this.checkHash();
	},

	suggest: function() {
		var self = App;
		var term = $("#search")[0].value.replace(/[^a-z0-9]/gi,'') || "";
		if (term.length < 3) {
			$('#suggestions').fadeOut();
		} else {
			$('#search').addClass('load');

			var data = localStorage.getItem(term);
			if (data){
				self.process(data);
			} else {
				$.post("search.php",
					{ queryString: "" + term + "" },
					function (data) {
						localStorage.setItem(term, data);
						self.process(data);
					}
				);
			}
		}
		self.updateHash();
	},

	process: function(data) {
		if (data.length > 9) {
			$('#suggestions').fadeIn();
			$('#suggestionsList').html(data);
		} else {
			$('#suggestions').fadeOut();
		}	
		$('#search').removeClass('load');
	},

	checkHash: function() {
		var hash = location.hash.replace("#/", "");
		if (hash.length > 2) {
			$("#search")[0].value = hash;
			this.suggest();
		}
	},

	updateHash: function() {
		var hash = $("#search")[0].value.replace(/[^a-z0-9]/gi,'');
		location.hash = (hash.length >= 3) ? "#/" + encodeURIComponent(hash) : "#/";
	}
};
App.init();

/* TODO:
- hash links - DONE
- pushstate, if supported
- localStorage caching for repeated queries - DONE
- pagination/more
- remove jquery
- swap with css3 effects
*/