export function calculateEstimates(basePrice, itemName) {

    if (!basePrice) return { zeptoPrice: 0, instamartPrice: 0 };

    const name = itemName.toLowerCase();
    
    const isEssential = name.includes('milk') || 
                        name.includes('butter') || 
                        name.includes('bread') ||
                        name.includes('eggs');

    const zeptoSign = Math.random() < 0.5 ? 1 : -1;
    const instamartSign = Math.random() < 0.5 ? 1 : -1;

    let zeptoMargin, instamartMargin;

    if (isEssential) {
        // Example: 1 + (1 * 0.015) = 1.015 (1.5% more expensive)
        // Example: 1 + (-1 * 0.015) = 0.985 (1.5% cheaper)
        //essentials will have less fluctuation
        zeptoMargin = 1 + (zeptoSign * (Math.random() * 0.02));      
        instamartMargin = 1 + (instamartSign * (Math.random() * 0.02));  
    } else {
        //non essentials may have more fluctuations
        zeptoMargin = 1 + (zeptoSign * (Math.random() * 0.08));      
        instamartMargin = 1 + (instamartSign * (Math.random() * 0.08));  
    }

    return {
        zeptoPrice: Math.round(basePrice * zeptoMargin),
        instamartPrice: Math.round(basePrice * instamartMargin)
    };
}