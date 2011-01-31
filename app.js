
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
      , {from:"/api", to: '../../'}
      , {from:"/api/*", to: '../../*'}
      , {from:"/*", to:'*'}
      
    ]
  , lists : {
      "feed": "function(head, req) { start({'headers': { 'Content-Type': 'application/rss+xml'}});  var rss = new XML('<rss/>'); rss.@version='2.0';   var channel = new XML('<channel/>');    channel.children += <title>JSConf US 2011 Speaker Proposals</title>;    channel.children += <link>http://2011.jsconf.us</link>;    channel.children += <copyright>2011 JSConf</copyright>;   channel.children += <language>en-us</language>;   var fr = getRow();  channel.children += (new XML('<lastBuildDate/>')).appendChild(fr.value.created);   var item = new XML('<item/>'); item.children += new XML('<title/>').appendChild(fr.value.title).appendChild(fr.value.name); item.children += new XML('<link/>').appendChild('http://2011.jsconf.us/#/'+fr.value._id);  item.children += new XML('<guid/>').appendChild('http://2011.jsconf.us/#/'+fr.value._id);  item.children += new XML('<pubDate/>').appendChild(fr.value.created);  item.children += new XML('<description/>').appendChild(fr.value.description).appendChild(fr.value.notes);  channel.children += item; while(row = getRow())  {     item = new XML('<item/>');  item.children += new XML('<title/>').appendChild(row.value.title).appendChild(row.value.name);     item.children += new XML('<link/>').appendChild('http://2011.jsconf.us/#/'+row.value._id);     item.children += new XML('<guid/>').appendChild('http://2011.jsconf.us/#/'+row.value._id);     item.children += new XML('<pubDate/>').appendChild(row.value.created);     item.children += new XML('<description/>').appendChild(row.value.description);     channel.children += item; }   rss.children += channel;  send(rss) }"
  },
  views : {
     "ordered": {
         "map": "function(doc) {\n  if (doc.title) {\n    emit(doc.created, doc);\n  }\n};\n"
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