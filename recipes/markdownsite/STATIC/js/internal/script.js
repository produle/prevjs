var docready = (doccallback) => {
  if (document.readyState != "loading") doccallback();
  else document.addEventListener("DOMContentLoaded", doccallback);
}


docready(() => { 
	
	//This is executed after page is loaded	
	
 
});