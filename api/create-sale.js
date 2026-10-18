export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const key = process.env.BLACKCAT_API_KEY;
  if (!key) return res.status(503).json({ error: 'Pagamento indisponível no momento.' });
  const { name, email, phone, document, lifetime } = req.body || {};
  if (![name,email,phone,document].every(v => typeof v === 'string' && v.trim())) return res.status(400).json({ error: 'Preencha todos os campos.' });
  const items = [{ title: 'Formação Agrônomo de Sucesso', unitPrice: 19770, quantity: 1, tangible: false }];
  if (lifetime === true) items.push({ title: 'Acesso vitalício', unitPrice: 6700, quantity: 1, tangible: false });
  try {
    const response = await fetch('https://api.blackcatoficial.com/api/sales/create-sale', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body: JSON.stringify({ amount: lifetime ? 26470 : 19770, currency: 'BRL', paymentMethod: 'pix', items,
        customer: { name: name.trim(), email: email.trim(), phone: phone.replace(/\\D/g,''), document: { number: document.replace(/\\D/g,''), type: 'cpf' } },
        pix: { expiresInDays: 1 }, metadata: 'Checkout AgroFácil' })
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: 'Não foi possível gerar o PIX. Confira os dados e tente novamente.' });
    return res.status(200).json(data);
  } catch { return res.status(502).json({ error: 'Falha ao conectar ao serviço de pagamento.' }); }
}