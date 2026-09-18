import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine, Base
from app.models.product import Product
from app.models.user import User
from passlib.hash import pbkdf2_sha256

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check existing products
        if db.query(Product).count() > 0:
            print("Database already contains product data. Skipping seed.")
            return

        products = [
            Product(
                product_id="PROD-ASUS-V15",
                name="ASUS Vivobook 15",
                description="Powerful laptop for work, study, creativity and entertainment. Features Intel Core i5 12th Gen, sleek metal design, ultra-fast 512GB NVMe SSD, and full HD NanoEdge display.",
                category="Laptops",
                price=59990.0,
                stock=25,
                rating=4.5,
                image_url="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
                processor="Intel Core i5-1235U (12th Gen)",
                ram="16GB DDR4 3200MHz",
                storage="512GB M.2 NVMe PCIe 4.0 SSD",
                display="15.6-inch FHD (1920 x 1080) Anti-glare NanoEdge",
                graphics="Intel Iris Xe Graphics",
                os="Windows 11 Home",
                warranty="1 Year Onsite Warranty + 1 Year Accidental Damage Protection",
                delivery="Free Express Delivery by Tomorrow"
            ),
            Product(
                product_id="PROD-DELL-X13",
                name="Dell XPS 13 Ultra",
                description="Ultra-thin premium laptop engineered with precision-cut aluminum and Corning Gorilla Glass 6. Unmatched performance and stunning 4K InfinityEdge display.",
                category="Laptops",
                price=114990.0,
                stock=15,
                rating=4.8,
                image_url="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
                processor="Intel Core i7-1360P (13th Gen)",
                ram="16GB LPDDR5",
                storage="1TB NVMe Gen4 SSD",
                display="13.4-inch UHD+ Touch (3840 x 2400) 500 nits",
                graphics="Intel Iris Xe Graphics",
                os="Windows 11 Pro",
                warranty="2 Years Premium Support Plus",
                delivery="Free Express Delivery"
            ),
            Product(
                product_id="PROD-HP-PAV14",
                name="HP Pavilion Plus 14",
                description="Dynamic OLED display laptop crafted for creators and professionals. Eyesafe certified display with all-day battery life and fast charge technology.",
                category="Laptops",
                price=72990.0,
                stock=20,
                rating=4.6,
                image_url="https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=800&auto=format&fit=crop&q=80",
                processor="Intel Core i5-1340P",
                ram="16GB LPDDR5x",
                storage="512GB Gen4 SSD",
                display="14-inch 2.8K OLED (2880 x 1800) 120Hz",
                graphics="Intel Iris Xe Graphics",
                os="Windows 11 Home + MS Office 2021",
                warranty="1 Year Onsite Warranty",
                delivery="Free Express Delivery"
            ),
            Product(
                product_id="PROD-LEN-LEG5",
                name="Lenovo Legion 5 Pro Gaming",
                description="High-performance gaming beast equipped with AMD Ryzen 7 and NVIDIA GeForce RTX graphics. Legion Coldfront 4.0 cooling system for peak frame rates.",
                category="Laptops",
                price=124990.0,
                stock=10,
                rating=4.9,
                image_url="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
                processor="AMD Ryzen 7 7735HS",
                ram="16GB DDR5 4800MHz",
                storage="1TB PCIe NVMe SSD",
                display="16-inch WQXGA (2560 x 1600) IPS 165Hz",
                graphics="NVIDIA GeForce RTX 4060 8GB GDDR6",
                os="Windows 11 Home",
                warranty="1 Year Ultimate Support + 1 Year Accidental",
                delivery="Free Express Delivery"
            ),

            # Accessories
            Product(
                product_id="PROD-ACC-WM01",
                name="Wireless Mouse",
                description="Ergonomic 2.4GHz wireless optical mouse with quiet click technology, adjustable DPI (800/1200/1600), and 18-month long battery life.",
                category="Accessories",
                price=799.0,
                stock=100,
                rating=4.4,
                image_url="https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
                processor="N/A",
                ram="N/A",
                storage="N/A",
                display="N/A",
                graphics="N/A",
                os="Compatible with Windows, macOS, ChromeOS",
                warranty="1 Year Replacement Warranty",
                delivery="Free Delivery on orders above ₹499"
            ),
            Product(
                product_id="PROD-ACC-CH65",
                name="65W Laptop Charger",
                description="Universal Type-C PD Fast Charger with GaN technology. Compact design, surge protection, and multi-protocol compatibility for laptops and smartphones.",
                category="Accessories",
                price=1499.0,
                stock=80,
                rating=4.7,
                image_url="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
                processor="GaN III Semiconductor",
                ram="N/A",
                storage="N/A",
                display="LED Power Indicator",
                graphics="N/A",
                os="Universal Type-C Power Delivery",
                warranty="1 Year Limited Warranty",
                delivery="Free Delivery"
            ),
            Product(
                product_id="PROD-ACC-KB01",
                name="Wireless Keyboard",
                description="Slim Bluetooth & 2.4GHz dual-mode wireless chiclet keyboard. Low-profile comfortable keys with rechargeable battery and quiet operation.",
                category="Accessories",
                price=1299.0,
                stock=60,
                rating=4.5,
                image_url="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
                processor="N/A",
                ram="N/A",
                storage="N/A",
                display="N/A",
                graphics="N/A",
                os="Compatible with Windows, macOS, Android, iOS",
                warranty="1 Year Manufacturer Warranty",
                delivery="Free Delivery"
            ),
            Product(
                product_id="PROD-ACC-CP01",
                name="Laptop Cooling Pad",
                description="RGB Gaming Cooling Pad with 5 quiet blue LED fans, adjustable height stand, dual USB ports, and optimal thermal airflow for heavy workloads.",
                category="Accessories",
                price=999.0,
                stock=75,
                rating=4.6,
                image_url="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
                processor="N/A",
                ram="N/A",
                storage="N/A",
                display="N/A",
                graphics="N/A",
                os="Supports Laptops up to 17.3 inches",
                warranty="6 Months Warranty",
                delivery="Free Delivery"
            )
        ]

        db.add_all(products)

        # Seed sample demo user
        demo_user = User(
            user_id="USR-101",
            name="Demo Customer",
            email="customer@ddtechhub.com",
            mobile="+91 9876543210",
            password_hash=pbkdf2_sha256.hash("password123")
        )
        db.add(demo_user)

        db.commit()
        print("Database seeded successfully with laptops, accessories, and demo user!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
