
var request = function (options, callback) {
  options.success = function (obj) {
    callback(null, obj);
  }
  options.error = function (err) {
    if (err) callback(err);
    else callback(true);
  }
  if (options.data && typeof options.data == 'object') {
    options.data = JSON.stringify(options.data)
  }
  if (!options.dataType) options.processData = false;
  if (!options.dataType) options.contentType = 'application/json';
  if (!options.dataType) options.dataType = 'json';
  $.ajax(options)
}

$.expr[":"].exactly = function(obj, index, meta, stack){ 
  return ($(obj).text() == meta[3])
}

var param = function( a ) {
  // Query param builder from jQuery, had to copy out to remove conversion of spaces to +
  // This is important when converting datastructures to querystrings to send to CouchDB.
	var s = [];
	if ( jQuery.isArray(a) || a.jquery ) {
		jQuery.each( a, function() { add( this.name, this.value ); });		
	} else { 
	  for ( var prefix in a ) { buildParams( prefix, a[prefix] ); }
	}
  return s.join("&");
	function buildParams( prefix, obj ) {
		if ( jQuery.isArray(obj) ) {
			jQuery.each( obj, function( i, v ) {
				if (  /\[\]$/.test( prefix ) ) { add( prefix, v );
				} else { buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "") +"]", v )}
			});				
		} else if (  obj != null && typeof obj === "object" ) {
			jQuery.each( obj, function( k, v ) { buildParams( prefix + "[" + k + "]", v ); });				
		} else { add( prefix, obj ); }
	}
	function add( key, value ) {
		value = jQuery.isFunction(value) ? value() : value;
		s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
	}
}

var ads, len, showingAd;
function spinTheWheel() {
  try {
    ads.hide();
    // console.log(showingAd);
    $(ads[showingAd]).show();
    showingAd = (showingAd+1)%len;
    setTimeout(spinTheWheel, 5000);
  } catch (e) {}
}


function randomizeOrder(container) {
    var c = $(container);
    var ads = $(".sponsor_ad", c);
    ads.detach();  // remove from dom
    ads.sort(function () {  return (Math.round(Math.random())-0.5); }); // randomize
    c.append(ads);
}

var app = {};
app.index = function () {
    $("#main").html($("#index").html());  
    randomizeOrder("#main .fs");
    randomizeOrder("#main .se");
  // ads = $("#main .se .sponsor_ad");
  // len = ads.length;
  // showingAd = Math.floor ( Math.random ( ) * len );
  // 
  // spinTheWheel();
};

app.speakers = function () {
  $("#main").html($("#speakers").html());
  if (ClosePixelate.supportsCanvas)  {
    $(".speaker").each(function () {
      if ($(this).hasClass("duo"))  {
        // handle duo

            var clean = $(".clearfix", this);
            var pixelate = clean.clone().prependTo(this).addClass("pixelated");
            $("img", pixelate).each(function () {
              this.closePixelate( [ { resolution: 6 }]);
            });
            $("img", clean).addClass("hide");

      } else {
        try {
            var clean = $("img", this);
            var pixelate = clean.clone().prependTo(this).addClass("pixelated");
            pixelate[0].closePixelate( [ { resolution: 6 }]);
            clean.addClass("hide");
        } catch (e) {}
      }
    }).hover(function () {
      $(".pixelated", this).addClass("hide")
      $("img", this).removeClass("hide");
    }, function () {
      $(".pixelated", this).removeClass("hide");
      $("img", this).addClass("hide");

    })
  }
}
app.about = function () {
  $("#main").html($("#about").html());  
}

app.sponsors = function () {
  $("#main").html($("#sponsors").html());  
  if (this.params['splat']) {
    $(document).scrollTop($("#"+this.params['splat']).offset().top-12);
  } else {
      $(document).scrollTop(0);
  }
}
app.venue = function () {
  $("#main").html($("#venue").html());  
}

var shrinkHeader = function () {
  $('div#logo').removeClass('logo').addClass('logo-on-page');
  $("div#main-header").addClass("on-top");
  $("img.logo-image").css({height: "100px"})
  // $('div#info').addClass('info-on-page');
  // $('img#logo-image').addClass('logo-on-page');
}





  
app.showProposal = function () {
  $('div#main').html('');
  request({url:'/api/'+this.params.id}, function (err, resp) {
    var twitter = (resp.twitter ? resp.twitter : {})
      , github = (resp.github && resp.github.user) ? resp.github.user : {}
      ;
    
    $('div#main').html(
      '<div class="talk">' +
        '<div class="talk-header">' +
          '<div class="talk-title">' + resp.title.replace("<", "&lt;").replace(">", "&gt;") + '</div>' +
          '<div class="talk-speaker">' +
            // '<img width=30 src="http://www.gravatar.com/avatar/' + hex_md5(resp.email) + '"></img>' +
            '<span class="talk-speaker-name">' + resp.name + '</span>' +
          '</div>' +
          '<div class="spacer"></div>' +
        '</div>' +
        '<div class="talk-description">' +
          '<blockquote class="talk-escaped-desc"></blockquote>' +
        '</div>' +
        '<div class="render-container">' +
          '<span class="render-button submit-button">render</span>' +
        '</div>' +
        '<div>Notes:</div>' +
        '<div class="talk-notes">' + resp.notes + '</div>' +
        '<div class="talk-speaker-info">' +
          '<div class="talk-speaker-twitter">' +
            '<div class="speaker-twitter-picture">' +
              '<img class="twitter-picture" src="' + twitter.profile_image_url + '" width="40"></img>' +
            '</div>' +
            '<div class="speaker-twitter-name">' + 
              '<a href="http://twitter.com/' + twitter.screen_name + '">@' + 
                twitter.screen_name + 
              '</a>' +
            '</div>' +
            '<div class="speaker-twitter-followcount">'+twitter.followers_count+' followers</div>' +
            // '<div class="spacer"></div>' +
            '<div class="speaker-twitter-description">'+twitter.description+'</div>' +
          '</div>' +
          '<div class="talk-speaker-github">' +
            '<div class="speaker-github-picture">' +
              '<img class="github-picture" src="http://www.gravatar.com/avatar/'+github.gravatar_id+'" width="40"></img>' +
            '</div>' +
            '<div class="speaker-github-url">' + 
              '<a href="http://github.com/'+github.login+'">github.com/'+github.login+'</a>' +
            '</div>' +
            // '<br><div class="spacer"></div>' +
            '<div class="speaker-github-followcount">'+github.followers_count+' followers</div>' +
            '<div class="speaker-github-repos">'+github.public_repo_count+' repos</div>' +
            '<div class="spacer"></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    )
    $('blockquote.talk-escaped-desc').text(resp.description);
    $('span.render-button')
    .hover(function () {
      $('span.submit-button').addClass('submit-hover');
    }, function () {
      $('span.submit-button').removeClass('submit-hover');
    })
    .click(function () {
      $('div.talk-description').html($('blockquote.talk-escaped-desc').text())
      $(this).remove();
    })
  })
  
}
var logged=false;

var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();


Sammy.log = (function () {});
$(function () { 
  
  if (BrowserDetect.OS == "Windows" || BrowserDetect.OS == "Win") {
    $("body").addClass("windowsneedsantialiasing");
  } else {
  }
  
  
  
  var m = new Image(); m.src="images/modal.gif";
  
  $("#frame").css({"-webkit-transition":"all 100000.0s linear","-moz-transition":"all 100000.0s linear","-o-transition":"all 100000.0s linear","-transition":"all 100000.0s linear","-webkit-transform":"translate(0px, 1px)", "-moz-transform":"translate(0px, 1px)","-o-transform":"translate(0px, 1px)","transform":"translate(0px, 1px)"});
  var trail = $("#trail"),
      wagon = $("<img src=\"images/wagon.gif\" alt=\"It's an 8-bit wagon, motherfucker.\" class=\"wagon\"/>").appendTo(trail);
  function westward() {
    var l = trail.width();
    wagon.css({ left: l }).animate({ left: -150 }, 20000, westward);
  }
  westward("Ho!");
  
  
  
  wagon.click(function (e) {
    if($("#overlay")) { $("#overlay").remove(); $("#smallbox").remove();$("audio")[0].pause(); } 
    $("body").append("<div id=\"overlay\"></div>").append("<img src=\"images/modal.gif\" id=\"smallbox\" height=\"42\" width=\"421\"/>");
    $("audio")[0].play();
    var wide = ($(window).width() / 2) - 210;
    var high = ($(window).height() / 2) - 21;			
  	var scrollTop = $(window).scrollTop();
  	$("#smallbox").css({
  	  top: high + scrollTop + "px",
      left: wide + "px"
  	}).fadeIn();
    $("#overlay").css({
  		  display: 'none',
        visibility: "visible"
    }).fadeIn();
  });
  $("#overlay").live("click", function(e) {
    $("audio")[0].pause();
    $("#overlay").remove();
    $("#smallbox").remove();
  });
  app.s = $.sammy(function () {
    // Call for proposals
    this.get("#/proposal/:id", app.showProposal);
    // this.get("#/proposal", app.proposal);
    this.get("#!/about", app.about);
    this.get("#!/speakers", app.speakers);
    this.get("#!/sponsors", app.sponsors);
    this.get(/\#!\/sponsors\/(.*)/ , app.sponsors);
    this.get("#!/venue", app.venue);

    this.get("#%21/about", app.about);
    this.get("#%21/speakers", app.speakers);
    this.get("#%21/sponsors", app.sponsors);
    this.get(/\#%21\/sponsors\/(.*)/ , app.sponsors);
    this.get("#%21/venue", app.venue);

    // Index of all databases
    this.get('', app.index);
    this.get("#!/", app.index);
  })
  if (window.location.pathname != "/proposals")
    app.s.run();
});
