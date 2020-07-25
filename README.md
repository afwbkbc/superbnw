# SuperBnW
Do you like BnW, but hate people there? SuperBnW is here to help! At last, you can make your great posts/comments and then sleep well, knowing that your content is under vigilant protection of supreme combination of the most bleeding-edge technologies of 
humanity!

# Features so far
As of now, SuperBnW is very new and small, but can already give you powerful (yet easy to use) advantages:
- Reads new replies to your posts/replies, and deletes them immediately if posted by somebody you blacklisted
- Detects messages you post and adds PGP signature so that they can be ultimately verified as written fully by you ( and not by server admin that hijacked your account or edited your post ). Also if you somehow lose your account you can always make new one and 
confirm it's still you by using same PGP certificate
# Considerations
- As of now SuperBnW can use only "simplified" interface, so it forces it during it's uptime, disallowing to change
- As of now BnW does not support editing of old messages ( due to poor design of it's protocol ), so in order to intercept and edit your message ( i.e. add PGP signature ) SuperBnW will have to delete/repost your post instead. This may cause minor inconvenience 
because post_id replied to you by BnW won't be valid anymore so you'll need to do a lookup to see id of reposted post ( this only happens if PGP is enabled, otherwise no need to repost message )
# Features planned ( highest priority to lowest )
- workaround for post_id change ( due to reposting ) inconvenience - SuperBnW will somehow notify you of new ( valid post_id ) after repost so you won't have to lookup
- "redeye" interface support ( so that SuperBnW could use whatever is currently active on your account )
- post history scanning upon SuperBnW start ( in case something got there during offline )
- statistics ( uptime, posts destroyed, and so on )
- Upyachka security module ( automatic retaliations to offending users )
- better blacklist flexibility: in addition to author username there will be keywords, size, maybe custom rules
- monitoring your manual reply deletions, adding frequent shitposters to blacklist automatically
- superbnw.im platform that will host multi-user SuperBnW environment and will allow you to login, attach your bnw account and get free 100% uptime of your posts protection and transparent pgp signing. later it will be develop further, featuring it's own superior 
UI, non-xmpp accounts support ( everything will still be posted on bnw ), transparent PGP signatures validation in messages, social networks ( facebook, vk, linkedin, instagram, twitter, ... ) integrations, ....

# Prerequisites
- node.js of recent version
- npm

# Installation
1) clone this repository
2) cd to cloned directory
3) run:
npm install
4) copy config.yml.sample to config.yml, open it with text editor and configure it's settings ( see comments in it for explanations )

# Launching
Launch SuperBnW by running:
node main.js
in cloned directory.

# Troubleshooting
If you encounter an error try these steps:
1) update SuperBnw to latest version ( git pull origin master )
2) update node.js to latest version
3) do npm install if not done already
4) if error still there - try to read what it says, try to understand the reason
5) if you can't understand it - enable backtrace in config, reproduce it and read relevant lines of code
6) if you managed to solve problem - please create pull request for master branch
7) if still can't solve problem - create issue in this repository
