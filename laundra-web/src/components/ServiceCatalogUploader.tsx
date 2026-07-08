import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useDatabase, type Item, type ServiceType, type ServiceVariant, type ItemPrice } from '../DatabaseContext';

interface Props {
  companyId: string;
}

export const ServiceCatalogUploader: React.FC<Props> = ({ companyId }) => {
  const { db, setItems, setServiceTypes, setServiceVariants, setItemPrices } = useDatabase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewData, setPreviewData] = useState<{
    items: Item[];
    serviceTypes: ServiceType[];
    serviceVariants: ServiceVariant[];
    itemPrices: ItemPrice[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

        if (data.length < 2) {
          throw new Error('Excel file must contain headers and at least one row of data.');
        }

        let headerRowIdx = -1;
        let itemColIdx = -1;

        // Scan the first 10 rows to find the header row containing "English"
        for (let i = 0; i < Math.min(10, data.length); i++) {
          const row = data[i];
          if (!row) continue;
          const idx = row.findIndex((h: any) => h && h.toString().toLowerCase().includes('english'));
          if (idx !== -1) {
            headerRowIdx = i;
            itemColIdx = idx;
            break;
          }
        }

        if (headerRowIdx === -1 || itemColIdx === -1) {
          throw new Error('Could not find a column header containing "English" in the first 10 rows. Please check your file.');
        }

        const headerRow1 = data[headerRowIdx];
        const headerRow2 = data[headerRowIdx + 1] || [];
        
        const arabicColIdx = headerRow1.findIndex((h: any) => h && h.toString().toLowerCase().includes('arabic'));

        // Check if the row immediately below the header has data that looks like variants but is empty under the 'English' column.
        // If it is empty under 'English', we assume it is a sub-header (e.g. Normal / Express).
        const isTwoRowHeader = (headerRow2[itemColIdx] === undefined || headerRow2[itemColIdx] === null || headerRow2[itemColIdx] === '');

        const serviceColumns: { colIdx: number; typeName: string; variantName: string }[] = [];
        let currentType = 'Standard';
        
        // Use Math.max of both row lengths to ensure we catch all columns even if top row is merged/empty
        const maxCols = Math.max(headerRow1.length, headerRow2.length);

        for (let idx = 0; idx < maxCols; idx++) {
          if (idx === itemColIdx || idx === arabicColIdx || (headerRow1[idx] && headerRow1[idx].toString().toLowerCase().includes('sl no'))) {
            continue;
          }
          
          let h1 = headerRow1[idx]?.toString().trim();
          let h2 = headerRow2[idx]?.toString().trim();
          
          if (isTwoRowHeader) {
            if (h1) currentType = h1;
            let variantName = h2 || 'Normal';
            // Only add if we actually have a service name
            if (currentType && currentType !== 'Sl No' && currentType !== 'English' && currentType !== 'Arabic') {
               serviceColumns.push({ colIdx: idx, typeName: currentType, variantName });
            }
          } else {
            if (!h1) continue;
            const parts = h1.split(' ');
            let variantName = parts.pop() || 'Normal';
            let typeName = parts.join(' ');
            if (!typeName) {
              typeName = variantName;
              variantName = 'Normal';
            }
            serviceColumns.push({ colIdx: idx, typeName, variantName });
          }
        }

        const newItems: Item[] = [...db.items];
        const newServiceTypes: ServiceType[] = [...db.serviceTypes];
        const newServiceVariants: ServiceVariant[] = [...db.serviceVariants];
        const newItemPrices: ItemPrice[] = [...db.itemPrices];

        let createdCount = 0;
        const dataStartIndex = isTwoRowHeader ? headerRowIdx + 2 : headerRowIdx + 1;

        for (let i = dataStartIndex; i < data.length; i++) {
          const row = data[i];
          const itemName = row[itemColIdx];
          if (!itemName) continue;

          let itemObj = newItems.find(it => it.companyId === companyId && it.englishName.toLowerCase() === itemName.toString().toLowerCase());
          if (!itemObj) {
            itemObj = {
              id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              companyId,
              englishName: itemName.toString(),
              arabicName: arabicColIdx !== -1 ? row[arabicColIdx]?.toString() : undefined,
              status: 'Active'
            };
            newItems.push(itemObj);
          }

          serviceColumns.forEach(sc => {
            const rawPrice = row[sc.colIdx];
            const parsedPrice = parseFloat(rawPrice);
            const price = isNaN(parsedPrice) ? null : parsedPrice;

            let sType = newServiceTypes.find(st => st.companyId === companyId && st.name.toLowerCase() === sc.typeName.toLowerCase());
            if (!sType) {
              sType = {
                id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                companyId,
                name: sc.typeName
              };
              newServiceTypes.push(sType);
            }

            let sVar = newServiceVariants.find(sv => sv.serviceTypeId === sType!.id && sv.name.toLowerCase() === sc.variantName.toLowerCase());
            if (!sVar) {
              sVar = {
                id: `sv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                serviceTypeId: sType!.id,
                name: sc.variantName
              };
              newServiceVariants.push(sVar);
            }

            let iPrice = newItemPrices.find(ip => ip.companyId === companyId && ip.itemId === itemObj!.id && ip.serviceVariantId === sVar!.id);
            if (iPrice) {
              if (price !== null) {
                iPrice.price = price;
              }
            } else {
              iPrice = {
                id: `ip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                companyId,
                itemId: itemObj!.id,
                serviceVariantId: sVar!.id,
                price
              };
              newItemPrices.push(iPrice);
              createdCount++;
            }
          });
        }

        setPreviewData({
          items: newItems,
          serviceTypes: newServiceTypes,
          serviceVariants: newServiceVariants,
          itemPrices: newItemPrices
        });
        setError(null);

      } catch (err: any) {
        setError(err.message || 'Error parsing Excel file.');
        setPreviewData(null);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    if (!previewData) return;
    setItems(previewData.items);
    setServiceTypes(previewData.serviceTypes);
    setServiceVariants(previewData.serviceVariants);
    setItemPrices(previewData.itemPrices);
    setPreviewData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    alert('Catalog imported successfully!');
  };

  const cItems = db.items.filter(i => i.companyId === companyId);
  const cTypes = db.serviceTypes.filter(s => s.companyId === companyId);
  const cPrices = db.itemPrices.filter(p => p.companyId === companyId);

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #cbd5e1' }}>
      <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>📦</span> Service Catalog Import Engine
      </h3>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #94a3b8' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#64748b' }}>
            Upload an Excel file to import or update services. Existing prices will be updated, missing prices will be kept as NULL.
          </p>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'block', width: '100%', padding: '8px', background: 'white', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          {error && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '10px' }}>⚠️ {error}</div>}
        </div>

        <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e3a8a', textTransform: 'uppercase' }}>Current Catalog</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e40af' }}>{cItems.length} <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Items</span></div>
            <div style={{ fontSize: '0.85rem', color: '#1e3a8a', marginTop: '4px' }}>{cTypes.length} Services | {cPrices.length} Prices</div>
          </div>
        </div>
      </div>

      {previewData && (
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>👀 Preview Import</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{previewData.items.filter(i => i.companyId === companyId).length}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Items Found</div>
            </div>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{previewData.serviceTypes.filter(i => i.companyId === companyId).length}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Service Types</div>
            </div>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{previewData.serviceVariants.filter(v => previewData.serviceTypes.find(t => t.id === v.serviceTypeId && t.companyId === companyId)).length}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Variants</div>
            </div>
            <div style={{ padding: '12px', background: '#dcfce7', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#16a34a' }}>{previewData.itemPrices.filter(i => i.companyId === companyId).length}</div>
              <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>Price Records</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setPreviewData(null)} style={{ padding: '10px 16px', background: 'transparent', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleImport} style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>✅ Confirm & Import</button>
          </div>
        </div>
      )}
    </div>
  );
};
