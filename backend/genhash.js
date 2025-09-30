const bcrypt = require("bcryptjs");

(async () => {
  const plain = "admin123"; // รหัสใหม่ที่อยากตั้ง
  const hash = await bcrypt.hash(plain, 10);
  console.log("Plain:", plain);
  console.log("Hash :", hash);
})();
