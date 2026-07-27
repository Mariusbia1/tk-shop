import { siteConfig } from '../config/siteConfig'
import { formatCurrency } from '../utils/formatCurrency'

export function createWhatsAppMessage(customer, items, total) {
  const articles = items.map((item, i) => `${i + 1}. ${item.name}
Quantité : ${item.quantity}
${item.size ? `Taille : ${item.size}\n` : ''}${item.color ? `Couleur : ${item.color}\n` : ''}${item.measurements ? `Mensurations : ${item.measurements}\n` : ''}${item.note ? `Personnalisation : ${item.note}\n` : ''}Prix unitaire : ${formatCurrency(item.price)}
Sous-total : ${formatCurrency(item.price * item.quantity)}`).join('\n\n')
  return `Bonjour ${siteConfig.name},

Je souhaite passer une commande.

Informations de la cliente :
Nom : ${customer.name}
Téléphone : ${customer.phone}
Ville : ${customer.city}
Adresse : ${customer.address}
Livraison : ${customer.delivery}

Articles :

${articles}

Total : ${formatCurrency(total)}

Commentaire :
${customer.comment || 'Aucun commentaire'}

Merci.`
}

export const whatsappUrl = (message) => `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`
