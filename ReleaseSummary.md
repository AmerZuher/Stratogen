### **V10 – Notifications, Reporting & Full LLM Integration**

- **Backend**
    
    - Updated existing libraries and added new ones for extended functionality.
        
    - Expanded database with **new tables and additional columns** for existing ones.
        
    - Modularized **conversation logic** under `llm_services` (better separation since multiple services exist).
        
    - Introduced a full **notification system** with backend event handling.
        
    - Added new **utilities**, including **report-to-PDF conversion**.
        
    - Created a dedicated **report_service** for structured reporting.
        
    - Refined all **LLM functions** and updated prompt engineering for better results.
        
- **Frontend**
    
    - Large-scale **UI/UX overhaul** and layout restructuring.
        
    - Added **Notification Center** and a dedicated **KPI page**.
        
    - Built new **investment sub-pages** (Documents, Proposals, Risks, Issues, Status, Tasks).
        
    - Upgraded **Chat feature** with improved LLM logic, styling, and response handling.
        
    - Introduced **direct LLM integration** in investment type pages (send investment data to the model with one click).
        
    - Implemented **role-, department-, team-, and user-based permissions**.
        
    - Laid the groundwork for the **future Admin Dashboard**.