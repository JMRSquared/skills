// Replace SURVEY with the approved draft, generated with JSON.stringify.
// Question types: text, paragraph, choice, checkbox, dropdown, grid.
const SURVEY = {
  title: 'Example product survey',
  description: 'Example does X for Y. This survey takes about 5 minutes.',
  questions: [
    { type: 'text', title: 'Company name' },
    { type: 'choice', title: 'Industry', choices: ['Retail', 'Logistics'], other: true, required: true },
    { type: 'grid', title: 'Which features matter most?', rows: ['Feature A', 'Feature B'], columns: ['1st', '2nd', '3rd', 'Not important'] },
  ],
};

function createForm() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty('FORM_ID');
  if (existingId) {
    logLinks_(FormApp.openById(existingId), 'Form already built, nothing created.');
    return;
  }
  const form = FormApp.create(SURVEY.title);
  form.setDescription(SURVEY.description);
  form.setProgressBar(true);
  form.setCollectEmail(false);
  SURVEY.questions.forEach((question) => addQuestion_(form, question));
  properties.setProperty('FORM_ID', form.getId());
  logLinks_(form, 'Form built.');
}

const BUILDERS_ = {
  text: (form) => form.addTextItem(),
  paragraph: (form) => form.addParagraphTextItem(),
  choice: (form, q) => form.addMultipleChoiceItem().setChoiceValues(q.choices).showOtherOption(Boolean(q.other)),
  checkbox: (form, q) => form.addCheckboxItem().setChoiceValues(q.choices).showOtherOption(Boolean(q.other)),
  dropdown: (form, q) => form.addListItem().setChoiceValues(q.choices),
  grid: (form, q) => form.addGridItem().setRows(q.rows).setColumns(q.columns),
};

function addQuestion_(form, question) {
  const build = BUILDERS_[question.type];
  if (!build) {
    throw new Error('Unknown question type "' + question.type + '". Use one of: ' + Object.keys(BUILDERS_).join(', '));
  }
  const item = build(form, question).setTitle(question.title).setRequired(Boolean(question.required));
  if (question.help) item.setHelpText(question.help);
}

function logLinks_(form, status) {
  Logger.log(status);
  Logger.log('Edit link: ' + form.getEditUrl());
  Logger.log('Share link: ' + form.getPublishedUrl());
  Logger.log('Form ID: ' + form.getId());
}
