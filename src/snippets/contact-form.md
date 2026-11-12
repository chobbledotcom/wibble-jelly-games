---
name: Contact Form
blocks:
  - type: html
    content: |
      <section class="enquiry" id="enquiry">
        <div class="enquiry__intro">
          <p class="eyebrow">Enquiries</p>
          <h2>Tell us what you need.</h2>
          <p>Tell us which game you are interested in, or what you want built. We will reply with prices and lead times.</p>
          <p class="enquiry__direct">Prefer email? <a href="mailto:info@wibblejellygames.com">info@wibblejellygames.com</a></p>
        </div>
        <form class="contact-form" action="https://submit-form.com/YOUR_FORMSPARK_FORM_ID" method="post">
          <input type="hidden" name="_subject" value="WibbleJelly Games website enquiry">
          <div class="contact-form__row">
            <label class="field">
              <span>Name</span>
              <input type="text" name="name" autocomplete="name" required>
            </label>
            <label class="field">
              <span>Email</span>
              <input type="email" name="email" autocomplete="email" required>
            </label>
          </div>
          <div class="contact-form__row">
            <label class="field">
              <span>Phone <small>optional</small></span>
              <input type="tel" name="phone" autocomplete="tel">
            </label>
            <label class="field">
              <span>Enquiry type</span>
              <select name="enquiry_type">
                <option>Buying a game</option>
                <option>Custom build</option>
                <option>Hire an activity</option>
                <option>Support</option>
                <option>Something else</option>
              </select>
            </label>
          </div>
          <label class="field">
            <span>Message</span>
            <textarea name="message" rows="5" required></textarea>
          </label>
          <div class="contact-form__footer">
            <button class="btn btn--primary" type="submit">Send enquiry</button>
            <p class="form-note">See our <a href="/privacy-policy/">privacy policy</a> for how we use your details.</p>
          </div>
        </form>
      </section>
---
