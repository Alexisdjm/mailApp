document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', () => send_email()); 
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#ver-un-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').disabled = false;
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('#compose-body').focus();
}

function load_mailbox(mailbox) {

  document.getElementById('emails-view').innerHTML = "";
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#ver-un-email').style.display = 'none';
  

  // Show the mailbox name
  if (mailbox === 'inbox') {

  color_class = 'inbox-color';
  font_class =  'inbox-font-color';

  } else if (mailbox === 'sent') {

    color_class = 'sent-color';
    font_class =  'sent-font-color';

  } else if (mailbox === 'archive') {

    color_class = 'archive-color';
    font_class =  'archive-font-color';
  }

  document.querySelector('#emails-view').innerHTML = `<div class='email-box-header ${color_class}'><p class='${font_class}'><i class="fa-solid fa-inbox"></i>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</p></div>`;



  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    if (emails.length > 0) {
      emails.forEach(element => {

        if (element.read == true) {
          readclass = 'read';
          readfont = 'read-font'
        } else {
          readclass = 'unread';
          readfont = 'unread-font';
        }

        const container = document.createElement('div');
        container.className = `${readclass}`;
        container.innerHTML = `<div class="grid"><div class="w-100"><div class="marginL"><p class='${readfont}'>${element.sender}</p></div></div><div class="w-100"><div class="marginL"><p class='${readfont}'>${element.subject}</p></div></div><div class="w-100"><div class="datejustify"><p class='${readfont}'>${element.timestamp}</p></div></div></div>`;
        container.addEventListener('click', () => { display_email(mailbox, element.id); read_email(element.id) })
        document.getElementById('emails-view').append(container)
      })
    } else {
      if (mailbox === 'inbox') {
        const container = document.createElement('div');
        container.innerHTML = '<h4 class="empty-message">You have not recieved any email 😭</h4>'
        document.getElementById('emails-view').append(container)
      } else if (mailbox === 'sent') {
        const container = document.createElement('div');
        container.innerHTML = '<h4 class="empty-message">You have not sent any email 🤣</h4>'
        document.getElementById('emails-view').append(container)
      } else if (mailbox === 'archive') {
        const container = document.createElement('div');
        container.innerHTML = '<h4 class="empty-message">You have not archived any email 🙃</h4>'
        document.getElementById('emails-view').append(container)
      }
    }
  });
};


function send_email() {
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
    })
  })
  .then(response => response.json())
  .then(result => {
      console.log(result);
      load_mailbox('sent')
  });

};

function display_email(mailbox, id) {
  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#ver-un-email').style.display = 'block';
  
  document.getElementById('ver-un-email').innerHTML = "";
  fetch(`/emails/${id}`)
  .then(response => response.json())    
  .then(email => {

    document.getElementById('ver-un-email').innerHTML = 

    `<div class='email-subject-container'>
      <h4 class='h4-fit'>${email.subject}<i class="mdi mdi-label-variant-outline"></i></h4>
      <div><i class="print-icon mdi mdi-printer-outline"></i><i class="print-icon mdi mdi-trash-can-outline"></i><i class="print-icon mdi mdi-tray-arrow-up"></i></div>
    </div>
    <div class='email-sender'>
      <i class="email-user fa-solid fa-circle-user"></i><div><p><'${email.sender}'></p><p class='for-me'>for me<i class="margin-down mdi mdi-menu-down"></i> ${email.recipients}</p></div>
      <div class='email-date-container'><i class="mdi mdi-paperclip"></i><p class='arial-small'>${email.timestamp}</p><i class="fa-regular fa-star"></i><i style='font-size:20px' id='reply' class="responder mdi mdi-arrow-left-top"></i><i class="fa-solid fa-ellipsis-vertical"></i></div>
    </div>
    `;

    document.getElementById('reply').addEventListener('click', () => reply_email(email))

    const body = document.createElement('div');
    body.className = 'email-body';
    body.innerHTML = `<pre><p>${email.body}</p></pre>`;
    document.getElementById('ver-un-email').append(body);

    const reply = document.createElement('button');
    reply.className = 'reply-button';
    reply.innerHTML = '<i class="button-icon-margin mdi mdi-arrow-left-top"></i>reply';
    document.getElementById('ver-un-email').append(reply); 
    reply.addEventListener('click', () => reply_email(email))

    if (mailbox === 'inbox') {
      const archivar = document.createElement('button')
      archivar.className = 'archive-button';  
      archivar.innerHTML = '<i class="button-icon-margin mdi mdi-archive-arrow-down-outline"></i> archive';
      document.getElementById('ver-un-email').append(archivar);
      archivar.addEventListener('click', () => archive_email(email.id, email.archived))
    }

    if (mailbox === 'archive') {
      const desarchivar = document.createElement('button')
      desarchivar.className = 'unarchive-button';
      desarchivar.innerHTML = '<i class="button-icon-margin mdi mdi-archive-arrow-up-outline"></i> unarchive';
      document.getElementById('ver-un-email').append(desarchivar);
      desarchivar.addEventListener('click', () => archive_email(email.id, email.archived))
    }
  })  

}

function reply_email(email) {
  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#ver-un-email').style.display = 'none';

  document.querySelector('#compose-body').focus();
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-recipients').disabled = true;
  document.querySelector('#compose-subject').value = ((email.subject.match(/^(Re:)\s/)) ? email.subject : "Re: " + email.subject);
  document.querySelector('#compose-body').value = `
  On ${email.timestamp}, <${email.sender}> wrote: \n ${email.body}
  ---------------------------------------------------
  `;
};

function archive_email(id, archived) {
  if (archived === true) {
    archived = false
  } else {
    archived = true
  }
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: archived
    })
  })

  location.reload()
}

function read_email(id) {
  
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}