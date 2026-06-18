# Module 8: Web Security

---

## 8.1 — Web Fundamentals & Server Configuration

### URL Structure
- Format: `scheme://[user:password]@hostname:[port]/path`
- Scheme used for HTTP and FTP
- Default port for web services: **80**
- Secure web traffic port: **443**
- HTTP is fundamentally a file transport protocol — the browser interprets files to render text and images

### Web Client/Server Model
- The browser (client) requests resources from a web server
- The server responds with HTML, images, and other files

### CGI (Common Gateway Interface)
- Provides an interface to allow tasks to be done via server-side applications
- Anytime user input is used to run server-side programs, **security risks are present**
- Outputs HTML
- Parameters come in through the browser; CGI outputs HTML back

### Web Server Directory Structure
- **cgi-bin** — default location for all CGI executables
- **conf** — configuration directory; hard-coded, web server reads this on startup
- **html** — document root (where web content lives)
- **logs** — server-side logs reside here; exact location is configurable

### Configuration Files (httpd.conf)
- Primary configuration file with many security-relevant options:
  - **User** — the UID the server will run applications as (default: -1)
  - **Group** — the GID (default: -1)
  - **Identity Check** — runs ident on the other side; not often used
  - **Directory Indexes** — handles paths that are not full paths; transfers a specific default file to user (e.g., `www.news.com/newnews` sends back a default file in the `newnews` directory)
  - **Access Control Files** — restricts access to files; can be global or per-directory
  - **Document Root** — when user types no path, files are served from this location
  - **User Dir** — defines subdirectory in the user's directory used as their default web dir (`/~user`)
  - **AccessFileName** — specifies user access on a directory-by-directory basis; `.htaccess` allows different logins per directory
  - **Alias** — allows access outside the document root; more secure than using symlinks
  - **ScriptAlias** — allows an alternate directory for CGI scripts
  - **IndexIgnore** — controls what the user can see in a directory (e.g., hide `.htaccess` files)

### HTTP Request & Response
- HTTP protocol exchange is stateless — each request is independent
- Requests use methods like **GET** and **POST**
- Responses include status codes, headers, and the requested content

### Access Control
- Directories need to be set to `711` (user needs execute permission)
- Directories need to be readable to allow access

### Basic Authentication
- Uses static passwords
- Typically uses the same password encryption as UNIX
- Web usernames/passwords can be **disjoint** from UNIX password file
- Global access control must be enabled
- Can have any number of password databases (one per directory)
- Can configure for group membership as well

### Directory Structure & .htaccess
- `.htaccess` can define different access rules for each branch of the root
- Access can be based on user, group, or both
- Different directories (J1, J2, J3, etc.) can have entirely different access requirements

### htpasswd Tool
- Creates or modifies a web password file
- Syntax: `htpasswd -c passwordfile username` (prompts for password twice)
- `-c` creates the file; omit `-c` if the file already exists
- **Anyone with write access to the directory can modify the password file**
- No dedicated program for group files — just a plain text file with `groupname: user1 user2`

### Rules on Access Control Files
- **Do not put password/group files in the document tree** — users could read them
- Place in `conf` or `/etc` directory
- No more or less secure than UNIX passwords — crack tools still work
- Access control files apply to the current directory **and all directories below it**
- Can restrict access based on: **User**, **Group**, **Host IP**

### Format of Access Control File (.htaccess)
- Looks like HTML with `<Limit>` and `</Limit>` tags
- `<Limit Get>` — limits GET requests
- `<Limit Post>` — limits POST replies
- Key directives:
  - `AuthType Basic` — standard authentication
  - `AuthUserFile` — path to password file
  - `AuthGroupFile` — path to group file
  - `AuthName` — text printed at top of login dialog box
  - `</Limit>` — ends the section

### Example Configuration
```
AuthUserFile  /etc/pw1
AuthGroupFile /etc/grp
AuthType  Basic
AuthName  Example1
<Limit Get>
  Require valid-user    # Anyone in the password file is allowed
</Limit>
```

More restrictive options:
- `Require user John Mary` — only Mary and John can access
- `Require group Admins` — only members of Admins group
- `Deny from all` — no one can authenticate
- `Allow from [hostname or domain]` — allow based on host/domain
- Order can be `deny,allow` or `allow,deny`

### Restrictive Rules Examples
**Rule set 1:**
```
order deny, allow
deny from all
allow from H1 D1
require user Mary Fred
require group Admins
```
→ Mary and Fred are allowed **only if** they came from H1 or D1 **and** they must be in the Admins group

**Rule set 2:**
```
order allow, deny
allow from all
deny from H1 D1
require user Mary Fred
```
→ H1 and D1 are blocked. Mary and Fred are allowed if they **don't** come from H1 or D1, and they must be in the Admins group

### Directory Options
Once users are authenticated, additional security options can be specified:
- **ExecCGI** — allow users to run CGI
- **Indexes** — allows user to see a directory listing if no index file exists
- **Includes** — usually not allowed due to security risks
- **All** — turn on all options
- **None** — turn off all options

### Global ACL
- Global ACL sets access controls for various parts of the directory tree
- **AllowOverride** must be granted for users to make distinct per-directory ACLs
- Override options:
  - `Limit` — allow/deny overrides
  - `Options` — options from the previous section
  - `All` — allows everything to be overridden
  - `None` — allows nothing to be overridden

### CMS (Content Management Systems)
- Most servers use a CMS (e.g., **WordPress**, **Drupal**) to run websites
- Used in cloud environments; users do not need access to the server OS
- Runs as an application on the server
- Supports its own authentication system
- Third-party plugins extend functionality (and introduce security risk)

---

## 8.2 — Web Server & Application Attacks

### OWASP Top Ten
- Reference: https://owasp.org/www-project-top-ten/
- Industry-standard list of the most critical web application security risks

### Web Server Attack Categories
1. **Server Executable Vulnerabilities** — many historical vulnerabilities in server code; automated tools exist to detect them; generally categorized under network application vulnerabilities
2. **Sample Files** — default files included in server distributions; some may execute things (default CGI scripts); some may support file uploading or debugging
3. **Source Code Disclosure** — allows users to view source code; mostly patched now
4. **Canonicalization Attacks** — manipulation of the URL format (e.g., if the server expects `c:\text.html` but receives `../text.html`); mostly patched
5. **Server Extensions** — additions like PHP, SSL, etc. that can have their own bugs
6. **Input Validation Attacks** — buffer overflows on CGI scripts, buffer overflows on the backend, injection attacks

### Web Server Vulnerability Scanners
- **Nikto**
- **Whisker 2.0**

### Web Application Attacks

**Web Crawling / Downloading**
- Download a website to look for places to attack
- Tools: **Wget**, **Offline Explorer Pro**
- Using Google to find unprotected password files: search `"index of /password"`

**Web Application Assessment Areas**
- Authentication
- Session Management
- Database interaction
- Generic Input Validation

**Common Vulnerabilities**
- Invalidated input
- Cross-Site Scripting (XSS)
- Injection flaws

### CGI Scripts
- Programs executed on the server; like shell scripts
- Parameters come in through the browser; CGI outputs HTML
- **Input validation is a must** for CGI scripts
- CGI-bin is where CGI scripts live; should **not** be put in the document tree
- Administrators typically don't allow users to create their own CGI scripts
- **Classic attack example**: A finger CGI script allowed web users to look up who was logged in; hackers sent `nobody; /bin/cat /etc/passwd` — the semicolon separated the command, and the passwd file was displayed on screen

### SQL Injection
- Putting raw SQL queries into form fields
- Results depend on the SQL implementation and how it is configured

### Cross-Site Scripting (XSS)
- Targets other users of the website
- Involves posting malicious code to a website (e.g., message board)
- The malicious code then executes in another user's browser

### Cookies
- Small files on the user's computer in which a website stores data
- HTTP is a stateless protocol — websites use cookies to maintain state about user information and habits
- **First implementation** of cookies allowed any site to read another site's cookie; now only the originating site can read its own cookie
- Passwords can be stored in clear text in cookies
- Session Cookies: temporary, expire after browser session
- Persistent Cookies: remain on device for a set period; used for long-term tracking

### Clear Gifs (Web Beacons)
- A one-pixel GIF or hyperlink to another site
- When loaded, sends information back to the server
- Allows people to track documents and user behavior

### Web Attacks Overview
- Comments in HTML documents — usually caught after the fact with logs
- CGI attacks
- Massive scans on web servers (CGI scan, Grinder — attacks all web servers: Apache, IIS, etc.)
- DoS (WebHug)

### SSL / Encrypted Transactions
- **SSL (Secure Socket Layer)** — broader application than just HTTP
- Creates a secure layer between HTTP and TCP
- Uses **port 443**
- Browser ships with certificates to support this service
- Communicates through an encrypted channel

### Server Logs
- **Access_Log** — logs all files transferred; has more privacy concern than security concern; syntax: `machine_name user authentication data time "command"` (usually GET or PUT); can fill up directory if running as root-level process
- **Referer_Log** — logs where a user came from; browser includes link information when a user clicks a link
- **Agent_Log** — logs which browser is connected to the site
- **Error_Log** — logs access attempts to files that don't exist

### Web Application Firewall
- Example: **WordFence** for WordPress
- Monitors, filters, and blocks malicious web traffic
- Provides email alerts for detected threats

---

## 8.3 — Client-Side Vulnerabilities

### Vulnerabilities in Web Technologies (Overview)
- HTML5 Vulnerabilities
- JavaScript Frameworks and Libraries
- Web Storage and Session Management Issues
- Risks associated with cookies
- Browser Extensions and Plugins

### Web / User Tracking

**Cookies**
- Session Cookies: temporary; expire after browser session
- Persistent Cookies: remain on device for a set period; used for tracking user preferences and behavior over time
- Third-party persistent cookies extensively used for cross-site user tracking → major privacy concern

**Web Beacons / Pixel Tracking**
- Tiny, invisible images embedded in emails and websites
- When loaded, send information back to the server (time viewed, engagement data)
- Used in email marketing and website analytics
- **Social Media Tracking**: Platforms use tracking pixels (e.g., Facebook Pixel) to track user activity on other websites for targeted advertising
- Social media platforms collect extensive data and sometimes share it with third parties

**Behavioral Tracking & Ads**
- Ad networks use tracking techniques to collect browsing habits, interests, and demographics for targeted ads
- **Retargeting**: ads shown based on previous internet actions
- **Location Tracking**: via IP addresses, GPS, or Wi-Fi network information
- **Mobile Device Identifiers**: unique IDs (Apple IDFA, Google Advertising ID) used to track users and serve personalized ads

### Client-Side Attack Types

**Man-in-the-Browser (MitB)**
- Malware infects a web browser and modifies web transactions, stealing confidential information without the user's knowledge
- Can manipulate online banking and other sensitive transactions

**Browser Extension Exploits**
- Malicious or compromised extensions can capture sensitive information, inject ads, redirect searches, or execute scripts

**Session Hijacking and Cookie Stealing**
- Attackers capture session cookies to impersonate the user
- Occurs when websites don't use secure cookies or the connection isn't encrypted (not HTTPS)

**Phishing Attacks**
- Web pages that mimic legitimate sites to steal user data
- Often coupled with social engineering tactics

**Watering Hole Attacks**
- Compromising a website frequently visited by a targeted group to infect their browsers with malware

**Zero-Day Browser Vulnerabilities**
- Exploiting previously unknown flaws in the browser before a patch is available

**DNS Spoofing (DNS Cache Poisoning)**
- Altering DNS records to redirect users to malicious sites instead of the intended destination

**SSL Stripping**
- Attacker downgrades a secure HTTPS connection to an unencrypted HTTP connection
- Intercepts data transferred between user and webserver

**WebRTC Leaks**
- Browser vulnerabilities expose a user's real IP address, even when using a VPN
- Privacy concern

**Malvertising**
- Malicious code injected into online ads
- Users can be infected by simply visiting a site with infected ads — no active downloading required

**Local File Inclusion (LFI) / Remote File Inclusion (RFI)**
- Allow attackers to include files on a server through the web browser
- LFI involves local files; RFI involves remote files
- Can lead to information disclosure, XSS, and other exploits

### Clickjacking
- A malicious technique where a user is tricked into clicking on something different from what they perceive — their click is "hijacked"
- **How it works**: A transparent frame is layered over a seemingly normal webpage element; when the user clicks it, they are actually interacting with a hidden element from another page
- **Consequences**: Granting access to camera/microphone, liking something on social media, or changing privacy settings — all without the user's awareness
- **Defense**:
  - Implement **Content Security Policy (CSP)** with `frame-ancestors` directive
  - Use **X-Frame-Options** HTTP header to control whether a page can be rendered in a `<frame>`, `<iframe>`, `<embed>`, or `<object>`

### Web-Based Cryptojacking
- Unauthorized use of someone else's computer to mine cryptocurrency via the browser
- **Mechanism**: Attackers embed a cryptocurrency mining script (e.g., CoinHive) into a website or ad; when users visit, their computer resources mine cryptocurrency
- **Impact**: Slows down user systems, increases electricity usage, causes hardware wear and tear
- **Mitigation**:
  - Browser extensions that block known crypto-mining scripts
  - Website admins should regularly scan for unauthorized script insertions

### Browser Fingerprinting
- Technique to track users across the web by collecting browser and device configuration information
- **How it works**: Collects OS, browser version, installed fonts, screen resolution, and other settings to create a unique device "fingerprint"
- **Privacy concern**: Can be done without storing data on the user's device and without user knowledge or consent
- **Countermeasures**: Privacy-focused browsers or extensions that limit shared information; clearing cookies and cache; anti-tracking tools

### Browser Lock Scams (Tech Support Scams)
- Also known as "tech support scam" or "browser lock" scams
- Social engineering attack designed to scare users into thinking their computer is infected
- **Trigger**: User visits a compromised or malicious website
- **Scare Tactics**: Pop-up message (often with loud voice) claiming the computer is infected with a virus or ransomware
- **Lockdown Effect**: Browser becomes unresponsive or pop-up reappears continuously, giving the illusion the computer is locked
- **Urgency & Payment**: Message urges calling a phone number for "tech support" and may ask for payment
