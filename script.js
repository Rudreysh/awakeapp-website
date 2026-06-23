const waitlistForm = document.querySelector("#waitlistForm");

if (waitlistForm) {
  waitlistForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(waitlistForm);
    const name = formData.get("name");
    const email = formData.get("email");
    const interest = formData.get("interest");
    const subject = encodeURIComponent("Awake waitlist request");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\nPlease add me to the Awake iOS waitlist.`
    );

    window.location.href = `mailto:hello@awakeapp.net?subject=${subject}&body=${body}`;
  });
}
