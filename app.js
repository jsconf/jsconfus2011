
 var couchapp = require('couchapp')
  , path = require('path')
  ;

ddoc = { _id:'_design/app'
  , rewrites : [
      {from:"/", to:'index.html'}
      , { 
          from:"proposals.rss", 
          to:'_list/feed/ordered',
          query: {
            descending: true
          }
        }
      , { 
          from:"rss.xml", 
          to:'_list/news_feed/articles',
          query: {
            descending: true
          }
        }
      , { 
          from:"proposals", 
          to:'_list/proposals/ordered',
          query: {
            descending: true
          }
        }
      , {from:"/api", to: '../../'}
      , {from:"/api/*", to: '../../*'}
      , {from:"/*", to:'*'}
      
    ]
  , lists : {
      "feed": "function(head, req) { start({'headers': { 'Content-Type': 'application/rss+xml'}});  var rss = new XML('<rss/>'); rss.@version='2.0';   var channel = new XML('<channel/>');    channel.children += <title>JSConf US 2011 Speaker Proposals</title>;    channel.children += <link>http://2011.jsconf.us</link>;    channel.children += <copyright>2011 JSConf</copyright>;   channel.children += <language>en-us</language>;   var fr = getRow();  channel.children += (new XML('<lastBuildDate/>')).appendChild(fr.value.created);   var item = new XML('<item/>'); item.children += new XML('<title/>').appendChild(fr.value.title).appendChild(fr.value.name); item.children += new XML('<link/>').appendChild('http://2011.jsconf.us/#/proposal/'+fr.value._id);  item.children += new XML('<guid/>').appendChild('http://2011.jsconf.us/#/proposal/'+fr.value._id);  item.children += new XML('<pubDate/>').appendChild(fr.value.created);  item.children += new XML('<description/>').appendChild(fr.value.description).appendChild(fr.value.notes);  channel.children += item; while(row = getRow())  {     item = new XML('<item/>');  item.children += new XML('<title/>').appendChild(row.value.title).appendChild(row.value.name);     item.children += new XML('<link/>').appendChild('http://2011.jsconf.us/#/proposal/'+row.value._id);     item.children += new XML('<guid/>').appendChild('http://2011.jsconf.us/#/'+row.value._id);     item.children += new XML('<pubDate/>').appendChild(row.value.created);     item.children += new XML('<description/>').appendChild(row.value.description);     channel.children += item; }   rss.children += channel;  send(rss) }",
      "news_feed": "function(head, req) { start({'headers': { 'Content-Type': 'application/rss+xml'}});  var rss = new XML('<rss/>'); rss.@version='2.0';   var channel = new XML('<channel/>');    channel.children += <title>JSConf US 2011 News</title>;    channel.children += <link>http://2011.jsconf.us</link>;    channel.children += <copyright>2011 JSConf</copyright>;   channel.children += <language>en-us</language>;   var fr = getRow();  channel.children += (new XML('<lastBuildDate/>')).appendChild(fr.value.created);   var item = new XML('<item/>'); item.children += new XML('<title/>').appendChild(fr.value.title); item.children += new XML('<link/>').appendChild('http://2011.jsconf.us/#!/articles/'+fr.value._id);  item.children += new XML('<guid/>').appendChild('http://2011.jsconf.us/#!/articles/'+fr.value._id);  item.children += new XML('<pubDate/>').appendChild(fr.value.created);  item.children += new XML('<description/>').appendChild(fr.value.description).appendChild(fr.value.notes);  channel.children += item; while(row = getRow())  {     item = new XML('<item/>');  item.children += new XML('<title/>').appendChild(row.value.title);     item.children += new XML('<link/>').appendChild('http://2011.jsconf.us/#!/articles/'+row.value._id);     item.children += new XML('<guid/>').appendChild('http://2011.jsconf.us/#!/articles'+row.value._id);     item.children += new XML('<pubDate/>').appendChild(row.value.created);     item.children += new XML('<description/>').appendChild(row.value.description);     channel.children += item; }   rss.children += channel;  send(rss) }",
      "proposals": "function(head, req) {    start({'headers': { 'Content-Type': 'text/html'  }  }); var body = '<!DOCTYPE html> <html lang=\"en-us\" dir=\"ltr\"> <head>   <link rel=\"alternate\" type=\"application/rss+xml\" href=\"http://2011.jsconf.us/rss.xml\"/><meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge;chrome=1\" >   <meta charset=\"utf-8\">   <title>JSConf US - May 2-3, 2011: Packing up and heading west, Portland Oregon.</title>   <meta name=\"viewport\" content=\"width=750\">  	<link rel=\"stylesheet\" href=\"fonts/stylesheet.css\" type=\"text/css\" charset=\"utf-8\">   <meta name=\"keywords\" content=\"jsconf, js conference, javascript conference, portland, oregon, best damn conference ever\" />   <meta name=\"description\" content=\"JSConf US 2011 - Try taking a journey by covered wagon across 2000 miles of plains, rivers, and mountains. Oh yes, WE ARE OFF TO OREGON\" />   <title>JSConf US - May 2-3, 2011: Packing up and heading west, Portland Oregon.</title> 	<link rel=\"shortcut icon\" href=\"images/favicon.png\" > 	<link rel=\"stylesheet\" href=\"fonts/stylesheet.css\" type=\"text/css\" charset=\"utf-8\">   <link href=\"style.css\" rel=\"stylesheet\" type=\"text/css\" />   </head>   <!--[if lt IE 9]>  <script src=\"http://html5shiv.googlecode.com/svn/trunk/html5.js\"></script>  <![endif]-->   <body>         <header>       <h1>The JSConf Trail</h1>       <h2>May 2-3, Version 2011</h2>       <div id=\"trail\"></div>     </header>  <nav>       <ul>         <li><a href=\"/#!/\">Home</a></li>      <li><a href=\"/proposals\">Proposals</a></li> <li><a href=\"/#!/sponsors\">Sponsors</a></li>         <li><a href=\"/#!/venue\">Venue</a></li>         <li><a target=\"_blank\" href=\"http://jsconf.blip.tv/\">Videos</a></li>         <!-- <li><a href=\"/schedule.html\">Schedule</a></li> -->         <li><a href=\"/#!/about\">About</a></li>       </ul>     </nav>     <div id=\"frame\">       <div id=\"main\" class=\"clearfix\"><h3>JSConf US 2011 Speaker Proposals</h3><ul>';  while(row = getRow())  { body += '<li><a href=\"http://2011.jsconf.us/#/proposal/'+row.value._id+'\">'+row.value.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')+' - '+row.value.name+'</a></li>'; } body += '</ul></div> <div id=\"footer\"></div> </div>    <div id=\"midi\"><audio loop><source src=\"http://jsconf.s3.amazonaws.com/midi.mp3\"/><source src=\"http://jsconf.s3.amazonaws.com/midi.ogg\"/></audio></div>  <script type=\"text/javascript\">     var _gaq = _gaq || [];    _gaq.push([\"_setAccount\", \"UA-1264213-15\"]);    _gaq.push([\"_trackPageview\"]);     (function() {      var ga = document.createElement(\"script\"); ga.type = \"text/javascript\"; ga.async = true;      ga.src = \"http://www.google-analytics.com/ga.js\";      var s = document.getElementsByTagName(\"script\")[0]; s.parentNode.insertBefore(ga, s);    })();    var addthis_config = {\"data_track_clickback\":true};     </script> <script language=\"javascript\" type=\"text/javascript\" src=\"jsconf.min.js\"></script>     <script type=\"text/javascript\" src=\"http://s7.addthis.com/js/250/addthis_widget.js#username=jsconf\"></script>            </body> </html>'; send(body); }"
  },
  views : {
     "ordered": {
         "map": "function(doc) {\n  if (doc.type == 'proposal') {\n    emit(doc.created, doc);\n  }\n};\n"
     },
    "articles": {
        "map": "function(doc) {\n  if (doc.type == 'article') {\n    emit(doc.created, doc);\n  }\n};\n"
    }
  }
}
  
ddoc.validate_doc_update = function (newDoc, oldDoc, userCtx) {   
  if (newDoc._deleted === true && userCtx.roles.indexOf('_admin') === -1) {     
    throw "Back the fuck off, only admins can admin."   
  } 
  if (oldDoc && userCtx.roles.indexOf("_admin") === -1) {
    throw "Back the fuck off, only admins can admin."   
  }
}

couchapp.loadAttachments(ddoc, path.join(__dirname, 'attachments'))

module.exports = ddoc