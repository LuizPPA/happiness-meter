let departments = [
  'Selecionar',
  'Atendimento',
  'Administrativo',
  'Financeiro',
  'TI'
]
let step = 1
let form_data = {
  name: '',
  department: 'Selecionar',
  rate: null,
  commentary: '',
  suggestion: '',
  complaint: ''
}

window.onload = () => {
  load_step_one(false)
}

window.onresize = () => {
  adjust_sizes()
}


let adjust_sizes = () => {
  let form = document.getElementById('form')
  let form_area = document.getElementById('form-area')
  let margin = (((form_area.clientHeight-form.clientHeight)/2)-53)+'px'
  form.style.marginTop = margin
}

let load_departments = () => {
  let select_element = document.getElementById('department')
  departments.forEach(department => {
    let option = document.createElement('option')
    option.value = department
    option.innerText = department
    option.disabled = department == 'Selecionar'
    select_element.appendChild(option)
  })
}

let clear_form_element = () => {
  let form = document.getElementById('form')
  let first = form.firstElementChild
  while (first) {
      first.remove()
      first = form.firstElementChild
  }
}

let fade_form_out = () => {
  let form = document.getElementById('form')
  let form_end = document.getElementById('form-end')
  form.className = 'row justify-content-center fading-out'
  form_end.className = 'row fading-out'
  setTimeout(() => {
    form.className = 'row justify-content-center'
    form_end.className = 'row'
  }, 800)
}

let fade_form_in = () => {
  let form = document.getElementById('form')
  let form_end = document.getElementById('form-end')
  form.className = 'row justify-content-center fading-in'
  form_end.className = 'row fading-in'
  setTimeout(() => {
    form.className = 'row justify-content-center'
    form_end.className = 'row'
  }, 800)
}

let disable_previous = () => {
  let button = document.getElementById('previous-button')
  button.disabled = true
}

let enable_previous = () => {
  let button = document.getElementById('previous-button')
  button.disabled = false
}

let disable_next = () => {
  let button = document.getElementById('next-button')
  button.disabled = true
}

let enable_next = () => {
  let button = document.getElementById('next-button')
  button.disabled = false
}

let set_button_text = (text) => {
  let button = document.getElementById('next-button')
  button.innerText = text
}

let next = () =>{
  switch(step){
    case 1:
      read_step_one()
      load_step_two()
      step = 2
      break
    case 2:
      load_step_three()
      step = 3
      break
    case 3:
      read_step_three()
      send()
      break
  }
}

let previous = () =>{
  switch(step){
    case 2:
      load_step_one()
      step = 1
      break
    case 3:
      read_step_three()
      load_step_two()
      step = 2
      break
  }
}

let read_step_one = () => {
  let name_input = document.getElementById('name')
  let department_input = document.getElementById('department')
  form_data.name = name_input.value
  form_data.department = department_input.value
}

let read_step_three = () => {
  let commentary_textarea = document.getElementById('commentary')
  let suggestion_textarea = document.getElementById('suggestion')
  let complaint_textarea = document.getElementById('complaint')
  form_data.commentary = commentary_textarea.value
  form_data.suggestion = suggestion_textarea.value
  form_data.complaint = complaint_textarea.value
}

let load_step_one = (fade = true) => {
  if(fade) fade_form_out()
  setTimeout(() => {
    clear_form_element()
    disable_previous()
    if(form_data.department == 'Selecionar') disable_next()
    else enable_next()
    let form = document.getElementById('form')
    let name_col = get_col(12, 12, 6, 6)
    let name_input = get_input('name', form_data.name)
    let name_label = get_label('name', 'Nome')
    name_col.appendChild(name_label)
    name_col.appendChild(name_input)
    let department_col = get_col(12, 12, 6, 6)
    let department_select = get_select('department', form_data.department)
    let department_label = get_label('department', 'Departamento*')
    department_col.appendChild(department_label)
    department_col.appendChild(department_select)
    form.appendChild(name_col)
    form.appendChild(department_col)
    adjust_sizes()
    load_departments()
    department_select.value = form_data.department
    fade_form_in()
  }, fade ? 800 : 0)
}

let load_step_two = () => {
  fade_form_out()
  setTimeout(() => {
    clear_form_element()
    set_button_text('Próximo')
    enable_previous()
    if(form_data.rate == null) disable_next()
    load_vote_buttons()
    adjust_sizes()
    fade_form_in()
  }, 800)
}

let load_step_three = () => {
  fade_form_out()
  setTimeout(() => {
    clear_form_element()
    set_button_text('Enviar')
    let form = document.getElementById('form')
    let commentary_col = get_col(12, 12, 12, 12)
    let commentary_textarea = get_textarea('commentary', form_data.commentary)
    let commentary_label = get_label('commentary', 'Comentário')
    commentary_col.appendChild(commentary_label)
    commentary_col.appendChild(commentary_textarea)
    let suggestion_col = get_col(12, 12, 12, 12)
    let suggestion_textarea = get_textarea('suggestion', form_data.suggestion)
    let suggestion_label = get_label('suggestion', 'Sugestão')
    suggestion_col.appendChild(suggestion_label)
    suggestion_col.appendChild(suggestion_textarea)
    let complaint_col = get_col(12, 12, 12, 12)
    let complaint_textarea = get_textarea('complaint', form_data.complaint)
    let complaint_label = get_label('complaint', 'Reclamação')
    complaint_col.appendChild(complaint_label)
    complaint_col.appendChild(complaint_textarea)
    form.appendChild(commentary_col)
    form.appendChild(suggestion_col)
    form.appendChild(complaint_col)
    adjust_sizes()
    fade_form_in()
  }, 800)
}

let vote_satisfaction = (rate) => {
  form_data.rate = rate
  clear_form_element()
  enable_next()
  load_vote_buttons()
}

let department_selected = () => {
  let department_input = document.getElementById('department')
  if(department_input.value != 'Selecionar') enable_next()
  else disable_next()
}

let send = () => {
  disable_next()
  disable_previous()
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      finish()
    }
    if(xhttp.readyState == 4 && xhttp.status != 200){
      enable_next()
      enable_previous()
    }
  }
  xhttp.open("POST", "https://us-central1-hapiness-meter.cloudfunctions.net/post_rate", true)
  // xhttp.open("POST", "http://localhost:5000/hapiness-meter/us-central1/post_rate", true)
  xhttp.send(JSON.stringify(form_data))
}

let finish = () => {
  fade_form_out()
  setTimeout(() => {
    clear_form_element()
    disable_next()
    disable_previous()
    let form_element = document.getElementById('form')
    let header_col = get_col(12, 12, 12, 12)
    let message_col = get_col(12, 12, 12, 12)
    let header = document.createElement('h3')
    let message = document.createElement('p')
    header.innerText = 'Avaliação enviada'
    message.innerText = 'Obrigado pelo seu feedback, dessa forma poderemos criar um ambiente mais agradável e produtivo.'
    header.style.textAlign = 'center'
    message.style.textAlign = 'center'
    header_col.appendChild(header)
    message_col.appendChild(message)
    form_element.appendChild(header_col)
    form_element.appendChild(message_col)
    adjust_sizes()
    fade_form_in()
  }, 800)
}

let get_col = (xs_size, sm_size, md_size, lg_size) => {
  let col = document.createElement('div')
  col.className = 'col-'+xs_size+' col-sm-'+sm_size+' col-md-'+md_size+' col-lg-'+lg_size
  return col
}

let get_input = (name, value) => {
  let input = document.createElement('input')
  input.id = name
  input.name = name
  input.type = 'text'
  input.value = value
  return input
}

let get_select = (name, value) => {
  let select = document.createElement('select')
  select.id = name
  select.name = name
  select.value = value
  select.onchange = () => {
    department_selected()
  }
  return select
}

let get_textarea = (name, value, rows) => {
  let textarea = document.createElement('textarea')
  textarea.id = name
  textarea.name = name
  textarea.value = value
  textarea.rows = rows
  return textarea
}

let get_vote_button = (type, icon, vote) => {
  let button = document.createElement('i')
  button.id = type
  if (vote == form_data.rate) {
    button.className = 'satisfaction-icon active far fa-'+icon
  }
  else{
    button.className = 'satisfaction-icon far fa-'+icon
  }
  button.onclick = () => {
    vote_satisfaction(vote)
  }
  return button
}

let get_label = (label_for, text) => {
  let label = document.createElement('label')
  label.for = label_for
  label.innerText = text
  return label
}

let load_vote_buttons = () => {
  let form = document.getElementById('form')
  let label_col = get_col(12, 12, 12, 12)
  let label = document.createElement('h4')
  label.innerText = 'Qual é seu nível de satisfação atual no trabalho?*'
  label_col.appendChild(label)
  let very_happy_button = get_vote_button('very-happy', 'grin', 5)
  let happy_button = get_vote_button('happy', 'smile', 4)
  let neutral_button = get_vote_button('neutral', 'meh', 3)
  let sad_button = get_vote_button('sad', 'frown', 2)
  let very_sad_button = get_vote_button('very-sad', 'sad-tear', 1)
  form.appendChild(label_col)
  form.appendChild(very_sad_button)
  form.appendChild(sad_button)
  form.appendChild(neutral_button)
  form.appendChild(happy_button)
  form.appendChild(very_happy_button)
}
