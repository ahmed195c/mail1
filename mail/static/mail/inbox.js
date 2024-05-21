document.addEventListener('DOMContentLoaded', function() {
let test = []
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  
 
 

  // submit handler 
  const formEl = document.querySelector('#compose-form')
  
  formEl.addEventListener('submit', event => {
    event.preventDefault()

    const formData = new FormData(formEl)
  
    let recip = formData.get('compose-recipients')
    let subj = formData.get('subject')
    let bodycontent = formData.get('body')

    console.log(`${recip} , ${subj} , ${bodycontent}`)
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recip,
          subject: subj,
          body: bodycontent
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent')
    });


  })
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(replay) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#show-email').style.display = 'none';
  console.log(replay)
  // Clear out composition fields
  if(replay === undefined){
    document.querySelector('#compose-recipients').value = ''; 
    document.querySelector('#compose-subject').value = '';
    document.querySelector('.form-group').style.display = 'none'
  }else{
    document.querySelector('#compose-recipients').value = replay.sender;
    document.querySelector('.form-group').style.display = 'block'
    // if the subject starts with re: dont add re:
    console.log(replay.subject.substring(0,3))
    if(replay.subject.substring(0,3) === 're:'){
      document.querySelector('#compose-subject').value = replay.subject;
    }else{
      document.querySelector('#compose-subject').value = "re:"+ replay.subject;
    }
  }
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#show-email').style.display = 'none';
  // Show the mailbox name
  
  let email_view =  document.querySelector('#emails-view')
  email_view.innerHTML = ""
  
  let emailsList = []



  fetch(`emails/${mailbox}`)
  .then(req => req.json())
  .then(data => {
    // Print emails
    console.log(data)
    // res.forEach(email => email_view.innerHTML = `<h1> ${email.sender}</h1>` ),
    data.forEach(email => emailsList.push(email))
    
    // ... do something else with emails ...

    emailsList.forEach(emailInEmailList => { 
      email_view.innerHTML += `
        <div class="cont">
          <div class="rightside">
            <button class="btnr">Show Email</button>
            <input class="email_id" type="text" hidden value="${emailInEmailList.id}"></input>
            <input class="email_read_stats" hidden value="${emailInEmailList.read}"></input>
            <p> ${emailInEmailList.sender}</p>
            <p>Subject: ${emailInEmailList.subject}</p>
          </div>
          <p>Time: ${emailInEmailList.timestamp}</p>
        </div>
      `
    }); 
    console.log(mailbox)
    if (mailbox !== "sent"){

      let N = document.querySelectorAll('.email_read_stats');
      N.forEach(email => {
        console.log(email.value)
        if (email.value === "true") {
          email.closest('.cont').classList.add('offwhitebg');
        }
      });
    }
      
    document.querySelectorAll('.btnr').forEach(btn => {
      btn.addEventListener('click', function (e) {
        console.log(e)
        console.log(this)
        let emailId = this.parentElement.querySelector('.email_id').value;
        
        showEmail(emailId)
        fetch(`/emails/${emailId}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      })  
  })
  })   
}


function showEmail(id){

  console.log("working")
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#show-email').style.display = 'block';

  let selcted_email =  document.querySelector('#show-email')
  
  console.log(id)
  intId = Number(id)

  fetch(`/emails/${intId}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    selcted_email.innerHTML = `
    <div id="show-email-cont"> 
      <span>from: <h1 class="emailSender"> ${email.sender} </h1></span>
      <p> To : ${email.recipients} </p>
      <p> Subject: ${email.subject} </p>
      <p> body : ${email.body} </p>
      <p> Timestamp: ${email.timestamp} </p>
      <button class="arc-btn"> archive </button>
      <button class="replay-btn" > Replay </button>
    </div>
    
    `
    // hide the replay button if the use is the sender
    let currentuser = document.querySelector('.userName').textContent
    let emailSenderEle = document.querySelector('.emailSender').textContent 
    let replatBtn = document.querySelector('.replay-btn')
    console.log(emailSenderEle, currentuser, replatBtn)
    console.log(typeof emailSenderEle)

    if(emailSenderEle.replace(/\s/g, "") === currentuser.replace(/\s/g, "") ){
      replatBtn.style.display = 'none';
    }

    if(email.archived === true){
      document.querySelector('.arc-btn').innerHTML = "unarchive"
    }else{
      document.querySelector('.arc-btn').innerHTML = "archive"
    }
      // get the archive button
      let arcBtn = document.querySelector('.arc-btn')
      // lisint to the event on the archive button
      arcBtn.addEventListener('click', () =>{
      // check if the email is archived or not  
        if(email.archived === true){
          document.querySelector('.arc-btn').innerHTML = "archive"
        }else{
          document.querySelector('.arc-btn').innerHTML = "unarchive"
        }
        let emailArc = null
        console.log("arc-Btnz ")
        if(email.archived === true){
          emailArc = false
        }else{
          emailArc = true
        }
        console.log(emailArc)
        // update the emial archive stats
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: emailArc
          })
        })
        // load mailbox after updating 
        load_mailbox('inbox')
        load_mailbox('inbox')

      }
    )




    // working on replay email 
    const replayElement = document.querySelector('.replay-btn')
    replayElement.addEventListener('click', () => compose_email(email))
});



}


function send_email(){
  event.preventDefault();


  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: 'baz@example.com',
        subject: 'Meeting time',
        body: 'How about we meet tomorrow at 3pm?'
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);

      load_mailbox('inbox')
  });
  
}


// class Names {
//     name = 'ahmed'
//     age = 50;
//   methods = function printObj(this) {
//       console.log(this.name)
//       console.log(this.age)
//     }
  
  
// }


// Names.printObj()