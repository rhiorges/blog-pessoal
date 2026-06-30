document.addEventListener('DOMContentLoaded', () => {
    
    // Inicializa ou busca os dados salvos no banco de dados local (localStorage)
    let blogData = JSON.parse(localStorage.getItem('blog_data')) || {
        'post-1': { likes: 0, dislikes: 0, userReaction: null, comments: [] }
    };

    // Função para salvar o estado atual
    function saveData() {
        localStorage.setItem('blog_data', JSON.stringify(blogData));
    }

    // Seleciona todos os posts na página
    const posts = document.querySelectorAll('.post');

    posts.forEach(post => {
        const postId = post.getAttribute('data-id');
        
        // Garante que o post exista no nosso objeto de dados
        if (!blogData[postId]) {
            blogData[postId] = { likes: 0, dislikes: 0, userReaction: null, comments: [] };
        }

        const data = blogData[postId];

        // Elementos do HTML do post atual
        const likeBtn = post.querySelector('.like-btn');
        const dislikeBtn = post.querySelector('.dislike-btn');
        const likeCount = post.querySelector('.like-count');
        const dislikeCount = post.querySelector('.dislike-count');
        const commentForm = post.querySelector('.comment-form');
        const commentsList = post.querySelector('.comments-list');

        // --- ATUALIZAÇÃO DA TELA (RENDER) ---
        function updateUI() {
            likeCount.textContent = data.likes;
            dislikeCount.textContent = data.dislikes;

            // Altera o visual dos botões se o usuário já clicou
            likeBtn.classList.toggle('active-like', data.userReaction === 'like');
            dislikeBtn.classList.toggle('active-dislike', data.userReaction === 'dislike');

            // Atualiza os ícones (preenchido vs linha)
            likeBtn.querySelector('i').className = data.userReaction === 'like' ? 'fa-solid fa-thumbs-up' : 'fa-regular fa-thumbs-up';
            dislikeBtn.querySelector('i').className = data.userReaction === 'dislike' ? 'fa-solid fa-thumbs-down' : 'fa-regular fa-thumbs-down';

            // Renderiza os comentários
            commentsList.innerHTML = '';
            data.comments.forEach(c => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';
                commentElement.innerHTML = `
                    <div class="author">${escapeHTML(c.name)}</div>
                    <div class="text">${escapeHTML(c.text)}</div>
                `;
                commentsList.appendChild(commentElement);
            });
        }

        // --- LÓGICA DE CURTIDAS (LIKE) ---
        likeBtn.addEventListener('click', () => {
            if (data.userReaction === 'like') {
                data.likes--;
                data.userReaction = null;
            } else {
                if (data.userReaction === 'dislike') {
                    data.dislikes--;
                }
                data.likes++;
                data.userReaction = 'like';
            }
            saveData();
            updateUI();
        });

        // --- LÓGICA DE DESCURTIDAS (DISLIKE) ---
        dislikeBtn.addEventListener('click', () => {
            if (data.userReaction === 'dislike') {
                data.dislikes--;
                data.userReaction = null;
            } else {
                if (data.userReaction === 'like') {
                    data.likes--;
                }
                data.dislikes++;
                data.userReaction = 'dislike';
            }
            saveData();
            updateUI();
        });

        // --- LÓGICA DE COMENTÁRIOS ---
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede a página de recarregar
            
            const nameInput = commentForm.querySelector('.comment-name');
            const textInput = commentForm.querySelector('.comment-text');

            const newComment = {
                name: nameInput.value.trim(),
                text: textInput.value.trim()
            };

            if (newComment.name && newComment.text) {
                data.comments.push(newComment);
                saveData();
                updateUI();

                // Limpa os campos do formulário
                nameInput.value = '';
                textInput.value = '';
            }
        });

        // Inicializa a interface do post com os dados salvos
        updateUI();
    });

    // Função de segurança simples para evitar que injetem códigos maliciosos nos comentários (XSS)
    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }
});
