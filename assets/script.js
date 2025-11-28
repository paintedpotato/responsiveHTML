// Common helpers
if(location.pathname.endsWith('admin.html')){
if(localStorage.getItem('church_admin')!=='1'){
alert('Not logged in. Redirecting to admin login.');
window.location.href='admin-login.html';
}
}


// Posts storage & utilities
function getPosts(){ return JSON.parse(localStorage.getItem('posts')||'[]'); }
function savePosts(p){ localStorage.setItem('posts', JSON.stringify(p)); }


// Admin post creation
const postForm = document.getElementById('postForm');
if(postForm){
postForm.addEventListener('submit', function(e){
e.preventDefault();
const type = document.getElementById('postType').value;
const title = document.getElementById('postTitle').value.trim();
const content = document.getElementById('postContent').value.trim();
const imgInput = document.getElementById('postImage');
const notice = document.getElementById('postNotice');
if(!title){ notice.style.display='block'; notice.textContent='Title required.'; return; }
const reader = imgInput && imgInput.files && imgInput.files[0] ? new FileReader() : null;
if(reader){
reader.onload = function(){ createPost(reader.result); };
reader.readAsDataURL(imgInput.files[0]);
} else createPost(null);


function createPost(imgData){
const posts = getPosts();
const post = {id:Date.now(), type, title, content, img:imgData, date:new Date().toISOString()};
posts.push(post); savePosts(posts);
notice.style.display='block'; notice.textContent='Post published.';
setTimeout(()=> notice.style.display='none',2000);
renderManagePosts();
renderGallery();
renderSermons();
postForm.reset();
}
});
}


// Render manage posts in admin
function renderManagePosts(){
const list = document.getElementById('postList'); if(!list) return;
const posts = getPosts().slice().reverse();
list.innerHTML='';
posts.forEach(p=>{
const div = document.createElement('div'); div.className='card';
div.innerHTML = `<strong>${p.title}</strong> <span class='small muted'>${p.type} • ${p.date.slice(0,10)}</span>`;
const del = document.createElement('button'); del.className='btn btn-ghost'; del.textContent='Delete';
del.style.marginLeft='1rem'; del.onclick = ()=>{ if(confirm('Delete post?')){ deletePost(p.id); } };
div.appendChild(del);
list.appendChild(div);
});
}
function deletePost(id){ const posts=getPosts().filter(p=>p.id!==id); savePosts(posts); renderManagePosts(); renderGallery(); renderSermons(); }


// Render gallery
function renderGallery(){ const g=document.getElementById('galleryGrid'); if(!g) return; const posts=getPosts().filter(p=>p.type==='gallery'); g.innerHTML=''; posts.reverse().forEach(p=>{ const d=document.createElement('div'); d.className='card'; d.style.minHeight='110px'; d.style.display='flex'; d.style.alignItems='center'; d.style.justifyContent='center'; if(p.img){ d.innerHTML=`<img src="${p.img}" alt="${p.title}" style="max-width:100%;border-radius:8px;">`; } else { d.textContent=p.title; } g.appendChild(d); }); }


// Build sermon groups
function renderSermons(){ const container = document.getElementById('sermonGroups'); if(!container) return; const posts = getPosts().filter(p=>p.type==='sermon'); const groups = {}; posts.forEach(p=>{ const d=new Date(p.date); const y=d.getFullYear(); const m=d.toLocaleString('default',{month:'long'}); groups[y]=groups[y]||{}; groups[y][m]=groups[y][m]||[]; groups[y][m].push(p); }); container.innerHTML=''; Object.keys(groups).sort((a,b)=>b-a).forEach(year=>{ const yBlock=document.createElement('div'); yBlock.innerHTML=`<h3>${year}</h3>`; Object.keys(groups[year]).forEach(month=>{ const mBlock=document.createElement('div'); mBlock.innerHTML=`<h4>${month}</h4>`; groups[year][month].forEach(p=>{ const item=document.createElement('div'); item.className='card'; item.style.marginTop='0.5rem'; item.innerHTML=`<strong>${p.title}</strong><br><div class='small muted'>${p.date.slice(0,10)}</div><div class='muted'>${p.content||''}</div>`; mBlock.appendChild(item); }); yBlock.appendChild(mBlock); }); container.appendChild(yBlock); }); }


// Initialize page-specific renders
if(document.getElementById('postList')) renderManagePosts();
if(document.getElementById('galleryGrid')) renderGallery();
if(document.getElementById('sermonGroups')) renderSermons();


// Public convenience: expose functions used by admin-login
window.handleAdminAuth = handleAdminAuth;
