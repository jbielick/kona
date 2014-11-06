
module.exports = {
  'show': get
}

function *get() {

  var router = this.router,
      match = router.match

  var link = router.url({
    controller: 'user',
    action: 'show',
    username: 'john'
  });

  var txt = 'You want to see the user: ' + match.username + ' - '
      txt += 'See John here: ' + link

  this.body = txt;

}