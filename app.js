
 var couchapp = require('couchapp')
  , path = require('path')
  ;

ddoc = { _id:'_design/app'
  , rewrites : [
        {from:"/", to:'index.html'}
      , {from:"/api", to: '../../'}
      , {from:"/api/*", to: '../../*'}
      , {from:"/*", to:'*'}
      
    ]
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