
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


function dysentery (e) {
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
  $(".content").hide();
  $("#index").show();
  randomizeOrder("#main .fs");
  randomizeOrder("#main .se");
  // ads = $("#main .se .sponsor_ad");
  // len = ads.length;
  // showingAd = Math.floor ( Math.random ( ) * len );
  // 
  // spinTheWheel();
};


app.troll= function () {
  dysentery();
}

var pixelated = false;
app.speakers = function () {
  $(".content").hide();
  $("#speakers").show();
  if (!pixelated && ClosePixelate.supportsCanvas)  {
    pixelated = true;
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
  $(".content").hide();
  $("#about").show();  
}

app.schedule = function () {
  $(".content").hide();
  $("#schedule").show();  
  var that = this;
  // allow time for schedule to load.
  setTimeout( function () {
    if (this.params['splat']) {
      $(document).scrollTop($("#"+that.params['splat']).offset().top-12);
    } else {
      $(document).scrollTop(0);
    }
  }, 500);
  
}

app.sponsors = function () {
  $(".content").hide();
  $("#sponsors").show();  
  if (this.params['splat']) {
    $(document).scrollTop($("#"+this.params['splat']).offset().top-12);
  } else {
    $(document).scrollTop(0);
  }
}
app.venue = function () {
  $(".content").hide();
  $("#venue").show();  
}
app.news = function () {
  $(".content").hide();
  $("#news").show();  
}

var shrinkHeader = function () {
  $('div#logo').removeClass('logo').addClass('logo-on-page');
  $("div#main-header").addClass("on-top");
  $("img.logo-image").css({height: "100px"})
  // $('div#info').addClass('info-on-page');
  // $('img#logo-image').addClass('logo-on-page');
}

function pretty_time(t) {
  var parts = t.split(":");
  var hi = parseInt(parts[0])
  var hour = hi % 12;
  var meridian = (hour == hi ? " AM" : " PM");
  if (hour == 0) { hour = 12; }

  return ""+hour+":"+parts[1]+meridian;
}


function render_track_b(tb, day, idx, extraclass) {
  if (!tb) { return ""; }
  var ec = (extraclass ? " "+extraclass : "");
  if (tb.title)
    return "<div class='tb locked"+ec+"' id='"+day+"-"+idx+"'><div class='title'>"+tb.title+"</div><div class='name'>"+tb.name+"</div></div>";
  else
    return "<div class='tb open"+ec+"'><a class='register' href='http://scheduler.jsconf.us/schedule/"+day+"/"+idx+"'>Sign up for this slot</a></div></div>";
}


function loadSchedule(data) {
  var str = "<h3>Monday May 2, 2011</h3><table id='mondayschedule' class='schedule'><tr class='scheduleheader'>              <th class='time'>Time</th>              <th class='track_a'>Track A</th>              <th class='track_b'>Track B</th>            </tr>";
  str += daySchedule(data, "monday");
  str += "</table>";
  str += "<div class='party'><p>The HP WebOS 8-bit Revenge Party at Candy Lounge and Ground Kontrol: 8:00PM - 2:00AM <a href='http://2011.jsconf.us/#!/articles/f572bdb75ea222a3ada0febe2fe9352a'>Details</a></p></div>";
  str += "<h3>Tuesday May 3, 2011</h3><table id='tuesdayschedule' class='schedule'><tr class='scheduleheader'>              <th class='time'>Time</th>              <th class='track_a'>Track A</th>              <th class='track_b'>Track B</th>            </tr>";
  str += daySchedule(data, "tuesday");
  str += "</table>";
  str += "<div class='party'><p>Yammer's Dropping the Closing Hammer Party: 8:00PM - 2:00AM <a href='http://2011.jsconf.us/#!/articles/14b8994ba86e576ba174a53513461474'>Details</a></p></div>";
  $("#jsconfschedule").html(str);
  
}

function daySchedule(data,day) {
  var ta_length = data.track_a[day].length;
  var ta = data.track_a[day];
  var tb = data.track_b[day];
  var data = [];
  for (var track_a_idx = 0, track_b_idx = 0; track_a_idx < ta_length; track_a_idx++) {
    var track_a = ta[track_a_idx];
    if (track_a.type == "break") {
      track_b_idx++;
      var item = "<tr class='break'><td>"+pretty_time(track_a.begin)+"</td><td colspan='2'>";
      if (track_a.title)
        item += "<div class='title'>"+track_a.title+"</div>";
      item += "<div class='name'>"+track_a.name+"</div></td></tr>";
      data.push( item );
    } else {
      var track_b_1_idx = track_b_idx++;
      var track_b_2_idx  = track_b_idx++;
      var track_b_1 = tb[track_b_1_idx];
      var track_b_2 = tb[track_b_2_idx];
      data.push("<tr><td class='time'>"+pretty_time(track_a.begin)+"</td><td class='track_a'><div class='title'><a href='"+track_a.href+"'>"+track_a.title+"</a></div><div class='name'>"+track_a.name+"</div></td><td class='track_b'>"+render_track_b(track_b_1, day, track_b_1_idx, "top")+render_track_b(track_b_2, day, track_b_2_idx)+"</td></tr>");
    }
  }
  return data.join("");
  
}




app.showArticle = function () {
  $(".content").hide();
  $('#article').html('').show();
  request({url:'/api/'+this.params.id}, function (err, resp) {
    var d = new Date(resp.created);
    var curr_date = d.getDate();
    var curr_month = d.getMonth()+1;
    var curr_year = d.getFullYear();
    $("#article").html("<h3>"+resp.title+"</h3><div class='sub'>Posted: "+([curr_month, curr_date, curr_year].join("/"))+"</sub>"+resp.description);
  });
};


app.showProposal = function () {
  $(".content").hide();
  $('#proposal').html('');
  request({url:'/api/'+this.params.id}, function (err, resp) {
    var twitter = (resp.twitter ? resp.twitter : {})
    , github = (resp.github && resp.github.user) ? resp.github.user : {}
    ;
    
    $('#proposal').html(
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
    ).show();
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
  
    app.s = $.sammy(function () {
    // Call for proposals
    this.get("#/proposal/:id", app.showProposal);
    // this.get("#/proposal", app.proposal);
    this.get("#!/about", app.about);
    this.get("#!/speakers", app.speakers);
    this.get("#!/schedule", app.schedule);
    this.get("#!/sponsors", app.sponsors);
    this.get(/\#!\/sponsors\/(.*)/ , app.sponsors);
    this.get(/\#!\/schedule\/(.*)/ , app.schedule);
    this.get("#!/venue", app.venue);
    this.get("#!/news", app.news);
    this.get("#!/articles/:id", app.showArticle);
    this.get("#/dysentery", app.troll);
    this.get("#%21/articles/:id", app.showArticle);
    this.get("#%21/news", app.news);
    this.get("#%21/about", app.about);
    this.get("#%21/speakers", app.speakers);
    this.get("#%21/sponsors", app.sponsors);
    this.get(/\#%21\/sponsors\/(.*)/ , app.sponsors);
    this.get(/\#%21\/schedule\/(.*)/ , app.schedule);
    this.get("#%21/venue", app.venue);

    // Index of all databases
    this.get('', app.index);
    this.get("#!/", app.index);
  })
  if (window.location.pathname != "/proposals")
    app.s.run();
  setTimeout(function () {
    var m = new Image(); m.src="images/modal.gif";
    var trail = $("#trail"),
    wagon = $("<img src=\"images/wagon.gif\" alt=\"It's an 8-bit wagon, motherfucker.\" class=\"wagon\"/>").appendTo(trail);
    function westward() {
      var l = trail.width();
      wagon.css({ left: l }).animate({ left: -150 }, 20000, westward);
    }
    westward("Ho!");
  
  
  
    wagon.click(dysentery);
    $("#overlay").live("click", function(e) {
      $("audio")[0].pause();
      $("#overlay").remove();
      $("#smallbox").remove();
    });

  }, 10);

  //  load articles
  $.getJSON("_view/articles?descending=true", function (data) {
    $.each(data.rows, function (idx) {
      var a = this.value;
      if (idx < 3) {
        $(".top_news").append("<div class='article'><h3>"+a.title+"</h3>"+a.description+"</div>");
      }
      $(".news_roll").append("<li><a href='#!/articles/"+a._id+"'>"+a.title+"</a></li>");
    });
  });

  $.getJSON("http://scheduler.jsconf.us/index.json?callback=?" , function (d) {
    loadSchedule(d);
  });
  
});
