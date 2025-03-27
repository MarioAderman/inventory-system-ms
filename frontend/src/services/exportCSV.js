import { exportCsv } from "./api";

const handleDownloadCSV = async (page) => {
    try {
        console.log(page)
        const response = await exportCsv(page || "data"); // Default to "data" if no page
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `export_${page}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Download error:", error);
    }
  };

export default handleDownloadCSV;