import * as XLSX from 'xlsx-js-style';
import type { Wine, Bottle, Location, StorageUnit } from '../types';

interface ExportData {
    wines: Wine[];
    bottles: Bottle[];
    locations: Location[];
    units: StorageUnit[];
}

export const exportToExcel = (data: ExportData) => {
    const { wines, bottles, locations, units } = data;

    // Create a map for quick lookups
    const wineMap = new Map(wines.map(w => [w.id, w]));
    const locationMap = new Map(locations.map(l => [l.id, l]));
    const unitMap = new Map(units.map(u => [u.id, u]));

    // Build rows - one row per bottle with reordered wine information
    const rows = bottles.map(bottle => {
        const wine = wineMap.get(bottle.wineId);
        const unit = unitMap.get(bottle.unitId);
        const location = unit ? locationMap.get(unit.locationId) : undefined;

        // Combine name and varietal into one column
        const nameVarietal = wine?.name
            ? `${wine.name}${wine.varietal?.length ? ' (' + wine.varietal.join(', ') + ')' : ''}`
            : wine?.varietal?.join(', ') || '';

        return {
            'Winery': wine?.producer || '',
            'Year': wine?.year || '',
            'Name/Varietal': nameVarietal,
            'Country': wine?.country || '',
            'Region': wine?.region || '',
            'Vineyard': wine?.vineyard || '',
            'Type': wine?.type || '',
            'Cellar Location': location?.name || '',
            'Storage Unit': unit?.name || '',
            'Grid Column': bottle.x + 1,
            'Grid Row': bottle.y + 1,
            'Grid Depth': bottle.depth + 1,
            'Status': bottle.status,
            'Date Added': bottle.dateAdded ? new Date(bottle.dateAdded).toLocaleDateString() : '',
            'Date Consumed': bottle.dateConsumed ? new Date(bottle.dateConsumed).toLocaleDateString() : '',
            'Rating': wine?.rating || '',
            'Consumption Rating': bottle.consumptionRating || '',
            'Consumption Notes': bottle.consumptionNotes || ''
        };
    });

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths for better readability
    const columnWidths = [
        { wch: 20 }, // Winery
        { wch: 8 },  // Year
        { wch: 35 }, // Name/Varietal (combined, wider)
        { wch: 15 }, // Country
        { wch: 20 }, // Region
        { wch: 20 }, // Vineyard
        { wch: 12 }, // Type
        { wch: 18 }, // Cellar Location
        { wch: 18 }, // Storage Unit
        { wch: 12 }, // Grid Column
        { wch: 12 }, // Grid Row
        { wch: 12 }, // Grid Depth
        { wch: 10 }, // Status
        { wch: 12 }, // Date Added
        { wch: 12 }, // Date Consumed
        { wch: 10 }, // Rating
        { wch: 15 }, // Consumption Rating
        { wch: 30 }, // Consumption Notes
    ];
    worksheet['!cols'] = columnWidths;

    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    // Header row style (bold, centered, grey background, borders)
    const headerStyle = {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { fgColor: { rgb: 'D3D3D3' } },
        border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
        }
    };

    // Data cell style (borders only)
    const dataStyle = {
        border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
        }
    };

    // Apply styles to all cells
    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (!worksheet[cellAddress]) continue;

            // Apply header style to first row, data style to other rows
            worksheet[cellAddress].s = row === 0 ? headerStyle : dataStyle;
        }
    }

    // Enable autofilter for all columns
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Wine Inventory');

    // Set freeze panes: Freeze first row (header)
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Generate filename with current date
    const today = new Date().toISOString().split('T')[0];
    const filename = `wine-inventory-${today}.xlsx`;

    // Write and download file
    XLSX.writeFile(workbook, filename);
};
