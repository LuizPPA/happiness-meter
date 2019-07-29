let resume_data = {
  average_rates: [],
  responses: []
}

let access_code = ''

window.onload = () => {
  prompt_code()
}

window.onresize = () => {
  adjust_sizes()
}

let prompt_code = () => {
  let resume = document.getElementById('resume')
  let code_row = get_row('code-row', true)
  let code_col = get_col(12, 8, 4, 4)
  let input = get_input('access-code', '')
  let label = get_label('access-code', 'Senha')
  let button_row = get_row('send-row', true)
  let button_col = get_col(12, 8, 4, 4)
  let button = get_button('send-code-button', send_code, 'Enviar')
  button.id = 'code-button'
  button_col.appendChild(button)
  button_row.appendChild(button_col)
  code_col.appendChild(label)
  code_col.appendChild(input)
  code_row.appendChild(code_col)
  resume.appendChild(code_row)
  resume.appendChild(button_row)
  adjust_sizes()
}

let send_code = () => {
  let code_input = document.getElementById('access-code')
  access_code = code_input.value
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      resume_data = JSON.parse(xhttp.responseText)
      load_resume()
    }
    if(xhttp.readyState == 4 && xhttp.status != 200){
    }
  }
  xhttp.open("GET", "https://us-central1-hapiness-meter.cloudfunctions.net/resume", true)
  xhttp.send()
}

let load_resume = () => {
  clear_resume_element()
  let resume = document.getElementById('resume')
  let average_row = get_row('average-row', false)
  let average_section_title_col = get_col(12, 12, 12, 12)
  let average_section_title = document.createElement('h4')
  average_section_title.id = 'average-section-title'
  average_section_title.innerText = 'Média de avaliações dos departamentos'
  average_section_title_col.appendChild(average_section_title)
  average_row.appendChild(average_section_title_col)
  let average_cols = load_average_cols()
  average_cols.forEach(col => {
    average_row.appendChild(col)
  })
  responses_row = get_row('responses-row', false)
  let responses_section_title_col = get_col(12, 12, 12, 12)
  let responses_section_title = document.createElement('h4')
  responses_section_title.id = 'responses-section-title'
  responses_section_title.innerText = 'Avaliações individuais'
  responses_section_title_col.appendChild(responses_section_title)
  responses_row.appendChild(responses_section_title_col)
  let response_cols = load_response_cols()
  response_cols.forEach(col => {
    responses_row.appendChild(col)
  })
  resume.appendChild(average_row)
  resume.appendChild(responses_row)
}

let load_average_cols = () => {
  let department_cols = resume_data.average_rates.map(rate_data => {
    let department_col = get_col(12, 6, 4, 4)
    department_col.classList.add('department-average')
    let department_name = document.createElement('p')
    let department_average_rate = document.createElement('p')
    let department_total_rates = document.createElement('p')
    department_name.innerText = `${rate_data.department}`
    department_average_rate.innerText = `Média de avaliações: ${rate_data.rate}`
    department_total_rates.innerText = `Total de avaliações: ${rate_data.total}`
    department_name.className = 'department-name'
    department_average_rate.className = 'department-average-rate'
    department_total_rates.className = 'department-total-rates'
    department_col.appendChild(department_name)
    department_col.appendChild(department_average_rate)
    department_col.appendChild(department_total_rates)
    return department_col
  })
  return department_cols
}

let load_response_cols = () => {
  let response_cols = resume_data.responses.map(response => {
    let response_col = get_col(12, 12, 12, 12)
    response_col.classList.add('response')
    let response_department = document.createElement('p')
    let response_briefing = document.createElement('p')
    let response_rate = document.createElement('p')
    let response_justification = document.createElement('p')
    response_department.className = 'response-department'
    response_briefing.className = 'response-name'
    response_rate.className = 'response-rate'
    response_justification.className = 'response-justification'
    response_department.innerHTML = `<b>Departamento:</b> ${response.department}`
    response_briefing.innerHTML = `<b>Para você, o que é ser feliz no trabalho?</b><br>${response.briefing}`
    response_rate.innerHTML = `<b>Avaliação:</b> ${response.rate}`
    let justification_label = 'Justificativa'
    if(response.rate > 3){
      justification_label = 'O que te deixa feliz trabalhando conosco?'
    }
    else{
      justification_label = 'O que falta para que você se sinta feliz trabalhando conosco?'
    }
    response_justification.innerHTML = `<b>${justification_label}</b><br>${response.justification}`
    response_col.appendChild(response_department)
    response_col.appendChild(response_briefing)
    response_col.appendChild(response_rate)
    response_col.appendChild(response_justification)
    return response_col
  })
  return response_cols
}

let null_or_empty = (str) => {
  return (str == '' || str == null)
}

let adjust_sizes = () => {
  let resume = document.getElementById('resume')
  let resume_area = document.getElementById('resume-area')
  let margin = (((resume_area.clientHeight-resume.clientHeight)/2)-53)+'px'
  resume.style.marginTop = margin
  resume.style.marginBottom = margin
}

let clear_resume_element = () => {
  let resume = document.getElementById('resume')
  let first = resume.firstElementChild
  while (first) {
      first.remove()
      first = resume.firstElementChild
  }
}

let fade_resume_out = () => {
  let resume = document.getElementById('resume')
  resume.className = 'col-12 fading-out'
  setTimeout(() => {
    resume.className = 'col-12'
  }, 800)
}

let fade_form_in = () => {
  let resume = document.getElementById('resume')
  resume.className = 'col-12 fading-in'
  setTimeout(() => {
    resume.className = 'col-12'
  }, 800)
}

let get_row = (id, center) => {
  let row = document.createElement('div')
  row.id = id
  center ? row.className = 'row justify-content-center' : row.className = 'row'
  return row
}

let get_col = (xs_size, sm_size, md_size, lg_size) => {
  let col = document.createElement('div')
  col.className = `col-${xs_size} col-sm-${sm_size} col-md-${md_size} col-lg-${lg_size}`
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

let get_label = (label_for, text) => {
  let label = document.createElement('label')
  label.for = label_for
  label.innerText = text
  return label
}

let get_button = (id, callback, text, custom_class = '') => {
  let button = document.createElement('button')
  button.id = id
  button.type = 'button'
  button.onclick = callback
  button.classList = `btn btn-secondary ${custom_class}`
  button.innerText = text
  return button
}

let form_transition_animation = (callback, fade = true) => {
  if(fade) fade_resume_out()
  setTimeout(() => {
    clear_resume_element()
    callback()
    adjust_sizes()
    fade_resume_in()
  }, fade ? 800 : 0)
}
