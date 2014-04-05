
var InstaBaby = InstaBaby || {};

if (window['console'] === undefined) {
    window.console = { log: function(){} };
}

InstaBaby= {
    init: function() {
        console.log("InstaBaby v0.1");
		scrollTo(0,0);
		$('instPass').focus();
        this.setupEvents();
		this.lastRequest = false;
    },

    setupEvents: function() {
    //  Any and all nesesary page events

        var instance = this;
        $$('div.btn').each(function(btn){
            Event.observe(btn, 'click', instance.btnClick.bind(instance));
        });

    },

    notify: function(elm, txt, status) {
        var notify       = elm.select('div.notify')[0] || {};
        notify.innerHTML = txt;//"<span>" + txt + "</span>";
        notify.className = "notify " + status;
		notify.show();
		if (status=="bad") {
			new Effect.Highlight(elm, { startcolor: '#FF0000', endcolor: '#cccccc' });
		}
        setTimeout(function(){ notify.fade(); },2000);
    },

    btnClick: function(e) {
        
        var btn      = e.target.up('div',0);
        var btnId    = btn.id;
        var instance = this;

        console.log('btnClick', btn, btnId, e);

        switch(true) {
            case (btnId=="doAuth"):

            //  Perform Auth and on success show next Step
                var user   = $('instUser').value;
                var pass   = $('instPass').value;
                var notify = $('credentials');
                var url    = "auth.php?user=" + user + "&pass=" + pass;

                this.auth(url, function(json){
                    var json = json[0];
                    if (json.code=="200") {
                        instance.notify(notify, "Sweet! Looks good...", "good");
                        instance.moveView('whatToRead');
                    } else {
                        instance.notify(notify, "Ouch! That doesn't seem to be the right email", "bad");
                        $('whatToRead').fade();
                    }
                });
                $('almost').fade(); // Just in case
                break;

            case (btnId=="doChoose"):
            //  Check content types chosen and show Section of TimesPeople options...

                var notify     = $('whatToRead');
                var isSections = $('chooseSections').checked;
                var isTP       = $('chooseTimesPeople').checked;

                if (isSections || isTP) {
                    instance.notify(notify, "Great! We're going places", "good");

                    if (isSections) {
                    	$('timespeople').fade();
                        instance.moveView('sections');
                    }

                    if (!isSections && isTP) {
                        $('sections').fade();
                        instance.moveView('timespeople');
                    }

					$('doSections').select('a')[0].innerHTML = (isSections && isTP) ? "More&hellip;" : "Next";

                } else {
                    instance.notify(notify, "Ouch! Um. You need to pick something", "bad");
                    $('sections').fade();
                    $('timespeople').fade();
                }
                $('almost').fade(); // Just in case
                break;

            case (btnId=="doSections"):

            //  Make sure at least one Section chosen
                var isChecked = false;
                var section   = $('sections');
                $('sections').select('input[type="checkbox"]').each(function(box){
                    if (box.checked) {
                        isChecked = true;
                    }
                });

                if (isChecked) {

					//	Whether to go to TimesPeople or skip to last
					if ($('chooseTimesPeople').checked) {
						instance.moveView('timespeople');
					} else {
						instance.moveView('almost');
					}

                } else {
                    instance.notify(section, "You need to pick at least one option", "bad");
                    $('almost').fade(); // Just in case
                }
                break;

            case (btnId=="doTimesPeople"):

            //  Perform Auth and on success show next Step
                var email  = $('tpEMail').value;
                var notify = $('timespeople');

                if (email) {
                    var url    = "svc/tp.php?email=" + email;
                    this.auth(url, function(json){
                        var json = json[0];
                        console.log('cb', json);
                        if (json.uid>0) {
                            $('tpUid').value = json.uid;
                            instance.moveView('almost');
                        } else {
                            instance.notify(notify, "Ouch! That doesn't seem to be the right email", "bad");
                            $('almost').fade(); // Just in case
                        }
                    });
                }
                break;

            case (btnId=="doUpdate"):
                
                console.log('Send to Instapaper....');
                
            //  Collect all values
                var instLogin = "user="      + $('instUser').value + "&pass=" + $('instPass').value;
                var nPicks    = "&npicks="   + this.getCheckBoxes('sections');
                var nLimit    = "&nlimit="   + this.getLimit('sections');
                var uid       = "&uid="      + $('tpUid').value;
                var tPicks    = "&tpicks="   + '';//this.getCheckBoxes('timespeople');
                var tLimit    = "&tlimit="   + this.getLimit('timespeople');
                var notify   = $('almost');

                var params    = instLogin + nPicks + nLimit + uid + tPicks + tLimit;
                var safe      = "user=" + $('instUser').value + nPicks + nLimit + uid + tPicks + tLimit;
                var url       = "http://ifelse.org/projects/instapaper/svc/add.php?" + params;

                this.auth(url, function(json){
                    var json = json[0];
                    console.log('Final', json);
                    if (json.total>0) {
                        instance.notify(notify, "Complete! " + json.total + " articles have been added!", "good");

						$('bmLink').href="javascript:location.href='http://ifelse.org/projects/instapaper/bookmarklet.html?" + safe + "&view=bookmark';";
						$('postUpdate').appear();

                    } else {
                        instance.notify(notify, "The sky is falling!", "bad");
                    }
                });
                break;
            default:
        }
    },

/* Build params */

    getCheckBoxes: function(elm) {
        var list = "";
        var elm  = $(elm);
        if (elm) {
            var boxes = elm.select('input[type=checkbox]');
            boxes.each(function(box){
                if (box.checked) {
                    list += box.value + ",";
                }
            });
        }
        return list.slice(0, -1);
    },

    getLimit: function(elm) {
        var elm   = $(elm);
        var limit = 0;
        if (elm) {
            var radios = elm.select('input[type=radio]');
            radios.each(function(r){
                if (r.checked) {
                    limit = r.value;
                }
            });
        }
        return limit;
    },

    moveView: function(id) {
        var elm       = $(id);
        var vpWidth   = document.viewport.getWidth();
        var vpOffsets = document.viewport.getScrollOffsets();
        var start     = vpOffsets.left;

        new Effect.Appear(id, { duration: 1.0, afterFinish: function(){

            var elOffsets = elm.cumulativeOffset();
            var width     = elm.offsetWidth;
            var end       = elOffsets.left - ((vpWidth-width)/2);

            new Effect.Tween(null, start, end, function(p){ scrollTo(p,0); });
        }});
    },
    
    /*
        Load Article or Section data
    */
    auth: function(url, callback) {
        new Ajax.Request(url, {
            method: 'get',
            onSuccess: function(response) {
                console.log('onSuccess: response',response);
                var data = response.responseText.evalJSON();
                if (callback) {
                    callback(data);
                }
            },
            onException: function(req,exception) {
                console.log('onException: request over',req,exception);
            }
        });
    }

};

/*
** Magic
*/

window.onload = function() {
    InstaBaby.init();
};