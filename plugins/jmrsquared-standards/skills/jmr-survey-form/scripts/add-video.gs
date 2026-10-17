// Fill in from the createForm log and the user's Unlisted YouTube link.
const FORM_ID = 'paste-form-id';
const VIDEO_URL = 'https://youtu.be/paste-video-id';
const PRODUCT = 'Example';

function addPromoVideo() {
  const form = FormApp.openById(FORM_ID);
  if (form.getItems(FormApp.ItemType.VIDEO).length > 0) {
    Logger.log('Form already has a video, nothing added: ' + form.getEditUrl());
    return;
  }
  const video = form.addVideoItem()
    .setVideoUrl(VIDEO_URL)
    .setTitle('Watch first: ' + PRODUCT + ' in 1 minute')
    .setHelpText('Please watch this short video before you answer the questions.');
  form.moveItem(video.getIndex(), 0);
  Logger.log('Video added above the first question: ' + form.getEditUrl());
}
