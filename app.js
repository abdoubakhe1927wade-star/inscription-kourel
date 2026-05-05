document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm'); // Formulaire membre
    const adminForm = document.getElementById('adminRegistrationForm'); // Formulaire chef
    const membersList = document.getElementById('membersList');
    const memberCount = document.getElementById('memberCount');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');

    // Charger les membres depuis le localStorage
    let members = JSON.parse(localStorage.getItem('kourelMembersMaster')) || [];

    function updateTable() {
        if (!membersList) return; // Si on n'est pas sur la page admin
        membersList.innerHTML = '';
        members.forEach((member, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.nom}</td>
                <td>${member.prenom}</td>
                <td>${member.telephone}</td>
                <td>${member.commission}</td>
                <td><button onclick="deleteMember(${index})" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">X</button></td>
            `;
            membersList.appendChild(row);
        });
        memberCount.textContent = members.length;
    }

    // LOGIQUE POUR LE MEMBRE (index.html)
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newMember = {
                nom: document.getElementById('nom').value,
                prenom: document.getElementById('prenom').value,
                telephone: document.getElementById('telephone').value,
                commission: document.getElementById('commission').value
            };

            // REMPLACEZ CETTE URL par votre URL Google Apps Script après publication
            const scriptURL = 'https://script.google.com/macros/s/AKfycbyadwc9YzFGINgSBM6-nDzR0hZeObpd26XY_Qo6Tli5Y0iGR5Q2zdpikeThA0ImLZNR/exec';

            // Afficher un message de chargement sur le bouton
            const submitBtn = registrationForm.querySelector('button');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;

            fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors', // Important pour Google Script
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember)
            })
            .then(() => {
                registrationForm.reset();
                alert('Félicitations ! Votre inscription a été enregistrée dans la liste officielle du Chef.');
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Une erreur est survenue. Veuillez réessayer ou contacter le chef.');
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // LOGIQUE POUR LE CHEF (admin.html)
    if (adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newMember = {
                nom: adminForm.querySelector('#nom').value,
                prenom: adminForm.querySelector('#prenom').value,
                telephone: adminForm.querySelector('#telephone').value,
                commission: adminForm.querySelector('#commission').value
            };

            members.push(newMember);
            localStorage.setItem('kourelMembersMaster', JSON.stringify(members));
            adminForm.reset();
            updateTable();
            alert('Membre ajouté à votre liste officielle !');
        });

        window.deleteMember = (index) => {
            if (confirm('Supprimer ce membre ?')) {
                members.splice(index, 1);
                localStorage.setItem('kourelMembersMaster', JSON.stringify(members));
                updateTable();
            }
        };

        downloadBtn.addEventListener('click', () => {
            if (members.length === 0) return alert('Liste vide');
            let csvContent = "data:text/csv;charset=utf-8,Nom;Prenom;Telephone;Commission\n";
            members.forEach(m => csvContent += `${m.nom};${m.prenom};${m.telephone};${m.commission}\n`);
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", "liste_officielle_kourel.csv");
            link.click();
        });

        clearBtn.addEventListener('click', () => {
            if (confirm('Effacer toute VOTRE liste officielle ?')) {
                members = [];
                localStorage.removeItem('kourelMembersMaster');
                updateTable();
            }
        });

        updateTable();
    }
});
