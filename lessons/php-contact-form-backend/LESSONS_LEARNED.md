# Lessons Learned — PHP Contact Form Backend
**Build #14 | PHP | Backend & Networking | 2026-06-28**

---

## What Worked Well

- **Modular PHP structure**: Separating concerns into `Validator.php`, `Mailer.php`, `Logger.php`, and `Storage.php` rather than one procedural script made each piece independently testable and replaceable.
- **Server-side validation first**: All validation (required fields, email format, message length, honeypot anti-spam) ran server-side before any email was sent, preventing wasted SMTP calls on bad input.
- **PDO for database storage**: Using PDO with prepared statements for storing submissions made SQL injection impossible by construction — parameterized queries are the only safe way to build SQL with user input.
- **PHPMailer for email delivery**: PHPMailer's SMTP integration with proper authentication and TLS was far more reliable than PHP's native `mail()` function, which requires server-level configuration.
- **Honeypot anti-spam**: A hidden `<input name="website">` field (invisible to users, filled by bots) let the server silently discard bot submissions without a CAPTCHA.

## Challenges Overcome

- **Email deliverability**: Emails sent via SMTP landed in spam. Fixed by: setting the correct `From`/`Reply-To` headers, adding SPF/DKIM records in DNS documentation, and sending from an authenticated domain.
- **CORS for cross-origin form submissions**: The frontend portfolio site and the PHP backend were on different origins. Added proper `Access-Control-Allow-Origin` and preflight handling, with the origin allowlist in a config file.
- **Rate limiting without a database**: A simple per-IP rate limit (5 submissions/hour) using a PHP `APCu` cache key prevented abuse without requiring Redis.
- **File attachment handling**: Validating uploaded files required checking both the MIME type (via `finfo_file`, not the browser-reported Content-Type) and the file extension. Buffer-based MIME detection catches spoofed extensions.

## Key Insights

- PDO prepared statements are not optional — they are the baseline for any SQL-facing PHP code. `$pdo->prepare($sql)->execute([$param])` is safer and often faster than string concatenation.
- Never trust `$_FILES['type']` for upload validation — it's set by the client. Always use `finfo` or `mime_content_type` to detect the actual file type.
- Honeypots work remarkably well for low-traffic forms and are invisible to legitimate users. Worth adding to any public form before reaching for reCAPTCHA.

## Next Time

- Add CSRF tokens to the form (hidden field with a session-bound token) as an additional layer against cross-site request forgery.
- Use a proper PHP framework like Slim or Laravel for routing rather than a single `index.php` dispatcher.
- Add an admin view to browse stored submissions with pagination and export.
- Write proper PHPUnit tests for the Validator and Mailer classes.

## Skills Gained

- PDO with prepared statements and parameterized queries
- PHPMailer: SMTP authentication, TLS, attachment handling
- PHP file upload security: `finfo`, MIME validation, size limits
- CORS headers and preflight handling in PHP
- Honeypot anti-spam implementation

## Integration Points

- The contact form backend is the direct backend for the **Portfolio Site (Build #26)** which uses Formspree; this build provides the self-hosted equivalent.
- The CORS configuration experience carried forward to the **URL Shortener API (Build #15)** Go backend.
- File upload security patterns (MIME validation, size limits) are transferable to any file-accepting backend.
