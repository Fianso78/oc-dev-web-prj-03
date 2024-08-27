// Fonction pour récupérer et afficher les images filtrées
function filterImages(category) {
    fetch('http://localhost:5678/api/works')
        .then(response => response.json())
        .then(works => {
            let node = '';
            let modalNode = '';

            works.forEach(work => {
                if (category === 'Tous' || work.category.name === category) {
                    node += `<figure data-id="${work.id}">
                                <img src="${work.imageUrl}" alt="${work.title}">
                                <figcaption>${work.title}</figcaption>
                             </figure>`;
                }
                modalNode += `<figure class="modal-figure" data-id="${work.id}">
                                <img src="${work.imageUrl}" alt="${work.title}">
                                <button class="delete-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                      <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5v-7zM4.118 4a1 1 0 0 1 .89-.553h6a1 1 0 0 1 .89.553L12.5 4H4.118zM14.5 4a1 1 0 0 1-1 1H2.5a1 1 0 0 1-1-1H14.5zM3.5 3h9a1 1 0 0 1 1 1v1h-1V4H4.5v1h-1V4a1 1 0 0 1 1-1zM5 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H5V1z"/>
                                    </svg>
                                </button>
                             </figure>`;
            });

            document.querySelector('#portfolio .gallery').innerHTML = node;
            document.querySelector('.modal-gallery').innerHTML = modalNode;

            // Ajout des gestionnaires d'événements pour les boutons de suppression
            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', function(event) {
                    event.preventDefault();
                    const figure = this.parentElement;
                    const id = figure.getAttribute('data-id');
                    console.log(`Tentative de suppression de l'image avec l'ID: ${id}`);
                    deleteImage(id, figure);
                });
            });
        })
        .catch(error => console.error('Erreur:', error));
}

function filterBouton() {
    fetch('http://localhost:5678/api/categories')
        .then(response => response.json())
        .then(categories => {
            let node = `<button class="filterbtn" id='Tous' >Tous</button>`;

            categories.forEach(category => {
                node += `<button class="filterbtn" id="${category.name}" >${category.name}</button>`;
            });

            document.querySelector('#portfolio .filters').innerHTML = node;
            addListenerToFilterButtons()
        })
        .catch(error => console.error('Erreur:', error));
}

function addListenerToFilterButtons() {
    const buttons = document.querySelectorAll('.filterbtn');

    document.getElementById('Tous').addEventListener('click', function(event) {
        event.preventDefault();
        filterImages('Tous');
    });

    buttons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const category = this.id;
            filterImages(category);
        });
    });
}

// Fonction pour supprimer une image
function deleteImage(id, figure) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Erreur: Pas de token trouvé');
        return;
    }

    console.log('Token utilisé pour la suppression:', token);

    fetch(`http://localhost:5678/api/works/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Statut de la réponse:', response.status);
        console.log('Texte de la réponse:', response.statusText);
        if (!response.ok) {
            return response.json().then(errorData => {
                console.error('Erreur lors de la suppression de l\'image:', errorData);
                console.error('Statut de la réponse:', response.status);
                console.error('Texte de la réponse:', response.statusText);
                throw new Error('Erreur lors de la suppression de l\'image');
            });
        }
        console.log(`Image avec l'ID: ${id} supprimée avec succès`);
        // Supprime l'image de la modale
        figure.remove();
        // Supprime l'image de la page principale
        const mainFigure = document.querySelector(`#portfolio .gallery figure[data-id="${id}"]`);
        if (mainFigure) {
            mainFigure.remove();
        }
    })
    .catch(error => console.error('Erreur:', error));
}

// Charger toutes les images par défaut lors du chargement de la page
document.addEventListener('DOMContentLoaded', function () {
    // Vérifiez si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const editBar = document.getElementById('edit-bar');
    const loginLogoutLink = document.getElementById('login-logout');
    const editButton = document.getElementById('edit-projects-button');
    const modal = document.getElementById('edit-modal');
    const closeButton = document.querySelector('.close-button');

    if (token) {
        editBar.classList.add('show');
        loginLogoutLink.textContent = 'logout';
        loginLogoutLink.href = '#'; // Prévenir la navigation
        loginLogoutLink.addEventListener('click', function () {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = 'index.html'; // Rediriger après déconnexion
        });
        editButton.style.display = 'block'; // Affiche le bouton "Modifier"
    } else {
        editBar.classList.remove('show');
        loginLogoutLink.textContent = 'login';
        loginLogoutLink.href = 'login.html';
        editButton.style.display = 'none'; // Cache le bouton "Modifier"
    }

    filterImages('Tous');
    filterBouton();

    // Ajout du gestionnaire d'événements pour le bouton "Modifier"
    editButton.addEventListener('click', function () {
        modal.style.display = 'block';
    });

    // Ajout du gestionnaire d'événements pour le bouton de fermeture
    closeButton.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Fermer la modale lorsqu'on clique en dehors du contenu de la modale
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Fonction pour ouvrir la vue d'ajout de photo
function openAddPhotoView() {
    document.querySelector('.modal-gallery-view').style.display = 'none';
    document.querySelector('.modal-add-photo-view').style.display = 'block';
}

// Fonction pour retourner à la vue de la galerie
function openGalleryView() {
    document.querySelector('.modal-add-photo-view').style.display = 'none';
    document.querySelector('.modal-gallery-view').style.display = 'block';
}

// Charger toutes les images par défaut lors du chargement de la page
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('edit-modal');
    const closeButton = document.querySelector('.close-button');
    const addPhotoButton = document.querySelector('.add-photo-button');
    const backButton = document.querySelector('.back-button');

   addCategoriesForList();
   
    // Ajout du gestionnaire d'événements pour le bouton "Ajouter une photo"
    addPhotoButton.addEventListener('click', openAddPhotoView);

    // Ajout du gestionnaire d'événements pour le bouton de retour
    backButton.addEventListener('click', openGalleryView);

    // Ajout du gestionnaire d'événements pour le bouton de fermeture
    closeButton.addEventListener('click', function () {
        modal.style.display = 'none';
        openGalleryView(); // Reset view to gallery when modal is closed
    });

    // Fermer la modale lorsqu'on clique en dehors du contenu de la modale
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            openGalleryView(); // Reset view to gallery when modal is closed
        }
    });
});

// Fonction pour basculer entre les vues
function openAddPhotoView() {
    document.querySelector('.modal-gallery-view').style.display = 'none';
    document.querySelector('.modal-add-photo-view').style.display = 'block';
}

function openGalleryView() {
    document.querySelector('.modal-add-photo-view').style.display = 'none';
    document.querySelector('.modal-gallery-view').style.display = 'block';
}

// Fonction pour afficher l'aperçu de l'image téléchargée
function previewPhoto() {
    const fileInput = document.getElementById('upload-photo');
    const preview = document.getElementById('photo-preview');
    preview.innerHTML = '';

    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > 4 * 1024 * 1024) {
            alert('Le fichier doit être inférieur à 4 Mo.');
            fileInput.value = ''; // Réinitialiser le champ fichier
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

// Fonction pour vérifier les entrées et activer le bouton de validation
function checkFormInputs() {
    const fileInput = document.getElementById('upload-photo');
    const titleInput = document.getElementById('photo-title');
    const categorySelect = document.getElementById('photo-category');
    const submitButton = document.getElementById('submit-photo');

    if (fileInput.files.length > 0 && titleInput.value.trim() !== '' && categorySelect.value !== '') {
        submitButton.disabled = false;
        submitButton.style.backgroundColor = '#1D6154'; // Vert
        submitButton.classList.add('enabled');
    } else {
        submitButton.disabled = true;
        submitButton.style.backgroundColor = 'grey';
        submitButton.classList.remove('enabled');
    }
}

// Fonction pour ajouter dynamiquement une photo via l'API
async function addPhoto() {
    const fileInput = document.getElementById('upload-photo');
    const titleInput = document.getElementById('photo-title');
    const categorySelect = document.getElementById('photo-category');
    const token = localStorage.getItem('token');
    console.log(token)

    if (fileInput.files.length === 0 || titleInput.value.trim() === '' || categorySelect.value === '') {
        alert('Veuillez remplir tous les champs et sélectionner une image.');
        return; // Si un champ est vide, ne rien faire
    }

    const file = fileInput.files[0];
    if (file.size > 4 * 1024 * 1024) {
        alert('Le fichier doit être inférieur à 4 Mo.');
        fileInput.value = ''; // Réinitialiser le champ fichier
        return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', titleInput.value);
    formData.append('category', categorySelect.value);
    console.log (titleInput.value, categorySelect.value)

    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // Ajouter l'image aux galeries en utilisant les données de réponse de l'API
            appendImageToGallery(data);
            appendImageToModalGallery(data);

            // Réinitialiser le formulaire
            fileInput.value = '';
            titleInput.value = '';
            categorySelect.value = '';
            checkFormInputs();
            openGalleryView();
        } else {
            alert('Erreur lors de l\'ajout de la photo : ' + (data.message || 'Réponse du serveur invalide.'));
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la photo:', error);
        alert('Une erreur est survenue. Veuillez réessayer plus tard.');
    }
}

// Fonction pour ajouter une image à la galerie principale
function appendImageToGallery(imageData) {
    const gallery = document.querySelector('.gallery');
    const figure = document.createElement('figure');
    figure.setAttribute("data-id",imageData.id)
    figure.innerHTML = `
        <img src="${imageData.imageUrl}" alt="${imageData.title}" />
        <figcaption>${imageData.title}</figcaption>
    `;
    gallery.appendChild(figure);
}

// Fonction pour ajouter une image à la galerie de la modale
function appendImageToModalGallery(imageData) {
    const modalGallery = document.querySelector('.modal-gallery');
    const modalFigure = document.createElement('figure');
    console.log(imageData)
    modalFigure.className = 'modal-figure';
    modalFigure.innerHTML = `
        <img src="${imageData.imageUrl}" alt="${imageData.title}" />
        <figcaption>${imageData.title}</figcaption>
        <button class="delete-button" onclick="deleteImage('${imageData.id}', event)">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m5 0v13a2 2 0 01-2 2H6a2 2 0 01-2-2V6h16z" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    `;
    modalGallery.appendChild(modalFigure);
}

// Fonction pour ouvrir la vue d'ajout de photo
function openAddPhotoView() {
    document.querySelector('.modal-gallery-view').style.display = 'none';
    document.querySelector('.modal-add-photo-view').style.display = 'block';
}

// Fonction pour retourner à la vue de la galerie
function openGalleryView() {
    document.querySelector('.modal-add-photo-view').style.display = 'none';
    document.querySelector('.modal-gallery-view').style.display = 'block';
}
function addCategoriesForList() {
    fetch('http://localhost:5678/api/categories')
        .then(response => response.json())
        .then(categories => {

            let node = `<option value="">Sélectionnez une catégorie</option>`;

            categories.forEach(category => {
                node += `<option value="${category.id}">${category.name}</option>`;
            });

            document.getElementById('photo-category').innerHTML = node;
        })
        .catch(error => console.error('Erreur:', error));
}
// Initialisation des événements
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('edit-modal');
    const closeButton = document.querySelector('.close-button');
    const addPhotoButton = document.querySelector('.add-photo-button');
    const backButton = document.querySelector('.back-button');
    const fileInput = document.getElementById('upload-photo');
    const titleInput = document.getElementById('photo-title');
    const categorySelect = document.getElementById('photo-category');
    const submitButton = document.getElementById('submit-photo');

    // Ajout du gestionnaire d'événements pour le bouton "Ajouter une photo"
    addPhotoButton.addEventListener('click', openAddPhotoView);

    // Ajout du gestionnaire d'événements pour le bouton de retour
    backButton.addEventListener('click', openGalleryView);

    // Ajout du gestionnaire d'événements pour le bouton de fermeture
    closeButton.addEventListener('click', function () {
        modal.style.display = 'none';
        openGalleryView(); // Reset view to gallery when modal is closed
    });

    // Fermer la modale lorsqu'on clique en dehors du contenu de la modale
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            openGalleryView(); // Reset view to gallery when modal is closed
        }
    });

    // Prévisualisation de la photo
    fileInput.addEventListener('change', function() {
        previewPhoto();
        checkFormInputs();
    });

    // Vérification des champs pour activer le bouton "Valider"
    titleInput.addEventListener('input', checkFormInputs);
    categorySelect.addEventListener('change', checkFormInputs);

    // Ajout de la photo à la galerie
    submitButton.addEventListener('click', addPhoto);
});
