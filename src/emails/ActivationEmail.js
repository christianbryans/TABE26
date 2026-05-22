import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function ActivationEmail({
  unit,
  activationLink,
}) {

  return `
  <div
    style="
      background:#EEF2F7;
      padding:48px 20px;
      font-family:Arial,sans-serif;
    "
  >
    <div
      style="
        max-width:430px;
        margin:0 auto;
        background:#FFFFFF;
        border-radius:24px;
        overflow:hidden;
        box-shadow:0 10px 40px rgba(0,0,0,0.08);
      "
    >

      <!-- HERO -->
      <div
        style="
          margin:32px 32px 0;
          height:190px;
          border-radius:18px;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 38%),
            linear-gradient(
              135deg,
              #00A6FF 0%,
              #007BFF 35%,
              #004CFF 70%,
              #0022FF 100%
            );
          overflow:hidden;
        "
      >
        <table width="100%" height="190" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" valign="middle">
              <img
                src="cid:aquoraLogo"
                alt="Aquora Logo"
                style="
                  width:170px;
                  height:auto;
                  display:block;
                "
              />
            </td>
          </tr>
        </table>
      </div>

      <!-- CONTENT -->
      <div
        style="
          padding:34px 32px 38px;
        "
      >

        <h1
          style="
            margin:0 0 22px;
            font-size:20px;
            line-height:1.4;
            color:#111827;
            font-weight:800;
          "
        >
          Halo, Selamat Datang di AQUORA
        </h1>

        <p
          style="
            margin:0 0 14px;
            font-size:14px;
            line-height:1.9;
            color:#6B7280;
          "
        >
          Anda telah ditambahkan sebagai pengguna di Aquora
          untuk unit
          <span style="font-weight:700; color:#111827;">
            ${unit}
          </span>.
        </p>

        <p
          style="
            margin:0 0 28px;
            font-size:14px;
            line-height:1.9;
            color:#6B7280;
          "
        >
          Untuk mulai menggunakan Aquora dan memantau
          penggunaan air Anda, silakan aktifkan akun dengan
          membuat kata sandi melalui tombol di bawah ini.
        </p>

        <!-- BUTTON -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:30px;">
          <tr>
            <td align="center">
              <a
                href="${activationLink}"
                style="
                  display:inline-block;
                  width:364px;
                  max-width:100%;
                  height:48px;
                  line-height:48px;
                  border-radius:999px;
                  text-decoration:none;
                  text-align:center;
                  color:#FFFFFF;
                  font-size:15px;
                  font-weight:700;
                  letter-spacing:0.2px;
                  background:
                    linear-gradient(
                      135deg,
                      #42B8FF 0%,
                      #008CFF 42%,
                      #004CFF 75%,
                      #0022FF 100%
                    );
                  box-shadow:
                    0 10px 28px rgba(0,114,255,0.28),
                    inset 0 1px 1px rgba(255,255,255,0.18);
                  font-family:Arial,sans-serif;
                  box-sizing:border-box;
                "
              >
                Aktivasi Akun &amp; Buat Kata Sandi
              </a>
            </td>
          </tr>
        </table>

        <p
          style="
            margin:0 0 18px;
            font-size:14px;
            line-height:1.9;
            color:#6B7280;
          "
        >
          Link ini akan kadaluarsa dalam
          <span style="font-weight:700; color:#111827;">
            24 jam
          </span>
          demi keamanan akun Anda.
        </p>

        <p
          style="
            margin:0;
            font-size:14px;
            line-height:1.9;
            color:#6B7280;
          "
        >
          Jika Anda tidak merasa mendaftar atau menerima
          undangan ini, Anda dapat mengabaikan email ini.
          Butuh bantuan? Hubungi tim kami melalui email ini.
        </p>

        <!-- FOOTER -->
        <div
          style="
            border-top:1px solid #E5E7EB;
            margin-top:34px;
            padding-top:24px;
          "
        >
          <p
            style="
              margin:0;
              font-size:14px;
              color:#6B7280;
            "
          >
            Terima kasih,
          </p>

          <p
            style="
              margin:6px 0 0;
              font-size:15px;
              font-weight:700;
              color:#111827;
            "
          >
            Tim Aquora
          </p>
        </div>

      </div>
    </div>
  </div>
  `;
}