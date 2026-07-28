import { siteConfig } from '../config/siteConfig'
import { formatCurrency } from '../utils/formatCurrency'

export function createWhatsAppMessage(customer, items, total, shopName = siteConfig.name) {
  const articles = items.map((item, i) => `${i + 1}. ${item.name}
Quantité : ${item.quantity}
${item.size ? `Taille : ${item.size}\n` : ''}${item.color ? `Couleur : ${item.color}\n` : ''}${item.measurements ? `Mensurations : ${item.measurements}\n` : ''}${item.note ? `Personnalisation : ${item.note}\n` : ''}Prix unitaire : ${formatCurrency(item.price)}
Sous-total : ${formatCurrency(item.price * item.quantity)}`).join('\n\n')
  return `Bonjour ${shopName},

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

export const whatsappUrl = (message, whatsapp = siteConfig.whatsapp) => `https://wa.me/${String(whatsapp).replace(/\D/g,'')}?text=${encodeURIComponent(message)}`
