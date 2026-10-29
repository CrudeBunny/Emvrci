const installButton=document.getElementById('install-app');
const installHelp=document.getElementById('install-help');
const installMessage=document.getElementById('install-message');
let installPrompt=null;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
window.addEventListener('appinstalled',()=>{installPrompt=null;installMessage.textContent='EmVRCI has been installed. Open it from your Home Screen or app launcher.';installHelp.hidden=false;installButton.setAttribute('aria-expanded','true');});
installButton.addEventListener('click',async()=>{
 installHelp.hidden=false;installButton.setAttribute('aria-expanded','true');
 if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true){installMessage.textContent='You are already using EmVRCI as a Home Screen app.';return;}
 if(installPrompt){const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();const choice=await prompt.userChoice;installMessage.textContent=choice.outcome==='accepted'?'Installation requested. Look for EmVRCI on your Home Screen or app launcher.':'Installation dismissed. You can still use EmVRCI in your browser.';return;}catch{}}
 const apple=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 installMessage.textContent=apple?'On iPhone or iPad: open this page in Safari, tap Share (the square with an upward arrow), then Add to Home Screen. If shown, turn on Open as Web App, then tap Add. You may need to scroll down the Share menu.':'Open your browser menu and choose Install app or Add to Home Screen if available. On iPhone: open this page in Safari, tap Share, then Add to Home Screen and Add.';
});
