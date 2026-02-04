
import React, { useState, useEffect } from 'react';
import { Plus, Download, Trash2, Save, RefreshCw, Loader2, Globe } from 'lucide-react';
import { InvoiceItem, Client, InvoiceData } from './types';
import { DEFAULT_COMPANY, CURRENCIES, DEFAULT_CURRENCY } from './constants';
import { downloadPDF } from './utils/pdfUtils';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData>({
    reference: '',
    date: new Date().toISOString().split('T')[0],
    sender: DEFAULT_COMPANY,
    client: {
      id: '',
      name: 'CHOKOGOOD',
      address: 'Hay Salam Morocco',
      cityZip: '',
      phone: '+212771701181'
    },
    items: [{ id: '1', description: 'SAHARA DELICE', quantity: 1, unitPrice: 11 }],
    tvaRate: 0,
    currency: DEFAULT_CURRENCY
  });

  const [savedClients, setSavedClients] = useState<Client[]>([]);

  const generateReference = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${year}-${random}`;
  };

  useEffect(() => {
    setInvoice(prev => ({ ...prev, reference: generateReference() }));
    const stored = localStorage.getItem('saved_clients');
    if (stored) setSavedClients(JSON.parse(stored));
  }, []);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0
    };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (id: string) => {
    if (invoice.items.length === 1) return;
    setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleSaveClient = () => {
    if (!invoice.client.name) return;
    const clientToSave = { ...invoice.client, id: Date.now().toString() };
    const updated = [...savedClients, clientToSave];
    setSavedClients(updated);
    localStorage.setItem('saved_clients', JSON.stringify(updated));
    alert('Client sauvegardé !');
  };

  const handleSelectClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = savedClients.find(c => c.id === e.target.value);
    if (selected) {
      setInvoice(prev => ({ ...prev, client: { ...selected } }));
    }
  };

  const subTotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const tvaAmount = (subTotal * invoice.tvaRate) / 100;
  const totalTTC = subTotal + tvaAmount;

  const onDownload = async () => {
    setIsGenerating(true);
    setTimeout(async () => {
      await downloadPDF('invoice-capture', `Facture-${invoice.reference}.pdf`);
      setIsGenerating(false);
    }, 200);
  };

  const labelStyle = "text-[#4338CA] font-bold text-[9px] uppercase tracking-[0.15em]";
  const getCurrencySymbol = (code: string) => code === 'EUR' ? '€' : code === 'USD' ? '$' : code;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-4 md:py-8 px-2 md:px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        
        {/* Top Control Bar */}
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 no-print border border-slate-200">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 w-full md:w-auto">
            <select 
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 min-w-[140px] md:min-w-[200px]"
              onChange={handleSelectClient}
              value={invoice.client.id}
            >
              <option value="">Sélectionner un client</option>
              {savedClients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
              <Globe size={14} className="text-slate-400" />
              <select 
                className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                value={invoice.currency}
                onChange={(e) => setInvoice(prev => ({ ...prev, currency: e.target.value }))}
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button 
              onClick={handleSaveClient}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap"
            >
              <Save size={14} /> Sauver Client
            </button>
            <button 
              onClick={() => setInvoice(prev => ({ ...prev, reference: generateReference() }))}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-transparent hover:border-indigo-100"
              title="Actualiser Référence"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          
          <button 
            disabled={isGenerating}
            onClick={onDownload}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] disabled:opacity-50 text-white px-6 md:px-8 py-2.5 rounded-xl font-bold transition-all shadow-md"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            TÉLÉCHARGER PDF
          </button>
        </div>

        {/* Invoice Area */}
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
          <div 
            id="invoice-capture" 
            className="bg-white p-8 md:p-12 relative mx-auto shadow-xl origin-top" 
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            {/* Header Row */}
            <div className="flex justify-between items-start mb-16 md:mb-20">
              <Logo />
              <div className="text-right">
                <h1 className="text-[44px] md:text-[54px] font-[900] text-[#4338CA] leading-none tracking-tight mb-4">FACTURE</h1>
                <div className="space-y-1">
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">N°:</span>
                    <span className="font-black text-slate-800 text-base md:text-lg">{invoice.reference}</span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">DATE:</span>
                    <span className="font-bold text-slate-500 text-base md:text-lg">{invoice.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Blocks */}
            <div className="grid grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
              <div>
                <p className={`${labelStyle} mb-3`}>DE</p>
                <div className="border border-slate-100 rounded-2xl p-4 md:p-6 bg-slate-50/20 min-h-[120px] md:min-h-[140px]">
                  <h3 className="font-black text-lg md:text-xl text-slate-900 mb-1 uppercase tracking-tight">{invoice.sender.name}</h3>
                  <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed font-semibold whitespace-pre-line mb-2">
                    {invoice.sender.address}
                  </p>
                  <p className="text-slate-900 text-[10px] md:text-xs font-black">{invoice.sender.taxId}</p>
                </div>
              </div>
              <div>
                <p className={`${labelStyle} mb-3`}>À</p>
                <div className="border border-slate-100 rounded-2xl p-4 md:p-6 bg-slate-50/20 min-h-[120px] md:min-h-[140px] space-y-2">
                  {isGenerating ? (
                    <>
                      <h3 className="font-black text-lg md:text-xl text-slate-900 uppercase tracking-tight">{invoice.client.name}</h3>
                      <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed font-semibold whitespace-pre-line">{invoice.client.address}</p>
                      <p className="text-slate-500 text-[10px] md:text-xs font-semibold">{invoice.client.phone}</p>
                    </>
                  ) : (
                    <>
                      <input 
                        className="font-black text-lg md:text-xl text-slate-900 bg-transparent border-none outline-none w-full p-0 uppercase"
                        value={invoice.client.name}
                        onChange={(e) => setInvoice(prev => ({ ...prev, client: { ...prev.client, name: e.target.value } }))}
                        placeholder="NOM CLIENT"
                      />
                      <textarea 
                        className="text-slate-500 text-[10px] md:text-xs font-semibold bg-transparent border-none outline-none w-full resize-none p-0 leading-relaxed overflow-hidden"
                        rows={2}
                        value={invoice.client.address}
                        onChange={(e) => setInvoice(prev => ({ ...prev, client: { ...prev.client, address: e.target.value } }))}
                        placeholder="Adresse"
                      />
                      <input 
                        className="text-slate-500 text-[10px] md:text-xs font-semibold bg-transparent border-none outline-none w-full p-0"
                        value={invoice.client.phone}
                        onChange={(e) => setInvoice(prev => ({ ...prev, client: { ...prev.client, phone: e.target.value } }))}
                        placeholder="Téléphone"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-12">
              <div className="grid grid-cols-12 border-b-2 border-[#4338CA] pb-3 mb-5 px-1">
                <div className={`col-span-7 ${labelStyle}`}>DESCRIPTION</div>
                <div className={`col-span-1 ${labelStyle} text-center`}>QTÉ</div>
                <div className={`col-span-2 ${labelStyle} text-right`}>UNITÉ</div>
                <div className={`col-span-2 ${labelStyle} text-right`}>TOTAL</div>
              </div>

              <div className="space-y-4">
                {invoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center px-1 group">
                    <div className="col-span-7 flex items-center gap-3">
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 no-print-capture shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                      {isGenerating ? (
                        <span className="w-full font-black text-slate-800 text-base md:text-lg uppercase">{item.description}</span>
                      ) : (
                        <input 
                          type="text"
                          className="w-full bg-transparent outline-none font-black text-slate-800 text-base md:text-lg border-none p-0 uppercase placeholder:text-slate-200"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Article..."
                        />
                      )}
                    </div>
                    <div className="col-span-1 text-center font-black text-slate-800 text-base md:text-lg">
                      {isGenerating ? item.quantity : (
                        <input 
                          type="number"
                          className="w-full bg-transparent outline-none text-center font-black text-slate-800 text-base md:text-lg border-none p-0"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      )}
                    </div>
                    <div className="col-span-2 text-right font-black text-slate-800 text-base md:text-lg">
                      {isGenerating ? item.unitPrice : (
                        <input 
                          type="number"
                          className="w-full bg-transparent outline-none text-right font-black text-slate-800 text-base md:text-lg border-none p-0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      )}
                    </div>
                    <div className="col-span-2 text-right font-black text-slate-900 text-base md:text-lg">
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                {!isGenerating && (
                  <button 
                    onClick={handleAddItem}
                    className="flex items-center gap-2 text-slate-300 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-widest transition-colors py-2 px-1"
                  >
                    <Plus size={14} /> Ajouter un article
                  </button>
                )}
              </div>
            </div>

            {/* Notes & Totals Section */}
            <div className="grid grid-cols-12 gap-8 md:gap-10 mt-16 md:mt-24">
              <div className="col-span-6">
                <p className={`${labelStyle} mb-3`}>NOTES / CONDITIONS</p>
                <div className="border border-slate-100 rounded-2xl p-4 md:p-6 bg-slate-50/10 min-h-[120px] md:min-h-[140px]">
                  <p className="font-black text-[10px] md:text-[11px] text-slate-800 mb-2 uppercase tracking-tight">Informations bancaires :</p>
                  {isGenerating ? (
                    <p className="text-slate-500 text-[10px] md:text-[11px] font-semibold leading-relaxed whitespace-pre-line">
                      {invoice.sender.bankInfo}
                    </p>
                  ) : (
                    <textarea 
                      className="w-full bg-transparent text-[10px] md:text-[11px] font-semibold text-slate-500 leading-relaxed resize-none outline-none overflow-hidden"
                      rows={3}
                      value={invoice.sender.bankInfo}
                      onChange={(e) => setInvoice(prev => ({ ...prev, sender: { ...prev.sender, bankInfo: e.target.value } }))}
                    />
                  )}
                </div>
              </div>

              <div className="col-span-6 flex flex-col justify-end">
                <div className="bg-[#F1F5FE] border border-indigo-100 rounded-[32px] p-6 md:p-8 space-y-4 md:space-y-6">
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`${labelStyle} text-indigo-400`}>SOUS-TOTAL HT</span>
                      <span className="font-black text-slate-900 text-sm md:text-base">
                        {subTotal.toFixed(2)} <span className="text-[10px] text-slate-400 ml-1">{invoice.currency}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`${labelStyle} text-indigo-400`}>TVA</span>
                        {isGenerating ? (
                          <span className="font-black text-slate-900 text-sm md:text-base">{invoice.tvaRate}</span>
                        ) : (
                          <input 
                            type="number" 
                            className="w-8 md:w-10 bg-transparent text-slate-900 font-black border-b border-indigo-200 text-center outline-none text-sm md:text-base p-0"
                            value={invoice.tvaRate}
                            onChange={(e) => setInvoice(prev => ({ ...prev, tvaRate: parseInt(e.target.value) || 0 }))}
                          />
                        )}
                        <span className="font-black text-slate-900 text-sm md:text-base">%</span>
                      </div>
                      <span className="font-black text-slate-900 text-sm md:text-base">
                        {tvaAmount.toFixed(2)} <span className="text-[10px] text-slate-400 ml-1">{invoice.currency}</span>
                      </span>
                    </div>
                  </div>

                  <div className="h-[1px] bg-indigo-200/50" />

                  <div className="flex justify-between items-end pr-2">
                    <div className="flex flex-col text-[#4338CA] mb-1">
                      <span className="font-black text-[9px] md:text-[10px] uppercase tracking-tighter leading-none">TOTAL</span>
                      <span className="font-black text-[9px] md:text-[10px] uppercase tracking-tighter leading-none">TTC</span>
                    </div>
                    <div className="flex items-baseline gap-2 text-[#4338CA]">
                      <span className="text-3xl md:text-5xl font-[900] tracking-tighter leading-none">
                        {totalTTC.toFixed(2)}
                      </span>
                      <span className="text-sm md:text-2xl font-black uppercase tracking-tighter shrink-0 mb-0.5">
                        {getCurrencySymbol(invoice.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div className="absolute bottom-10 left-0 right-0 px-8 md:px-12 text-center border-t border-slate-50 pt-8">
              <p className="text-[8px] md:text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] flex flex-wrap justify-center gap-2 md:gap-6">
                <span>{invoice.sender.name}</span>
                <span className="hidden md:inline">•</span>
                <span className="lowercase font-medium">{invoice.sender.email}</span>
                <span className="hidden md:inline">•</span>
                <span>{invoice.sender.taxId}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {isGenerating && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          <p className="font-black text-indigo-900 uppercase tracking-widest text-xs">Traitement PDF...</p>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default App;
