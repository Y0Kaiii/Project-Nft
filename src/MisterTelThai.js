import React from "react";
import './styles.css'; // Create this CSS file to style the OurStory section
import JarLogo from './assets/images/JarLogo.png'

const MisterTelThai = () => {
    return (
      <section className="Tel-story">
        <div className="NFT-Tel-Story">
                  <img src={JarLogo} alt="Tel"></img>
              </div>
        <div className="Tel-container">
          <h2 className="Tel-title"></h2>
          <p className="Tel-content">“ขวดโหลแห่งมิส-ต่าร์เทล”
          <p> ที่ที่เก็บซ่อนความสงบไว้ในดินแดนลึกลับ</p>
          <p> เพียงคุณเปิดใจและก้าวเข้าสู่อาณาเขตของธรรมชาติ</p>
          <p> อันอัศจรรย์ในโลกเล็กๆ แห่งนี้</p>
          <p> ทุกหัวใจจะได้รับการเยียวยา</p>
          <p> ทุกหัวใจจะได้รับการปลอบประโลม</p>
          <p> และทุกหัวใจจะได้รับกำลังใหม่</p>
          <p> มาค้นหา “ขวดโหลแห่งมิส-ต่าร์เทล” ของคุณกันค่ะ</p>
          </p>
        </div>
        </section>
    )
}

export default MisterTelThai;