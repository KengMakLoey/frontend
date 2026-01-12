import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "../components/layout/Header.tsx";
import { User } from "lucide-react"; // ใช้ไอคอนแทนรูปคนใน footer
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../components/ui/form";
import { API } from "../components/shared/api.ts";
import { toast } from "sonner";
import type { QueueData } from "../components/shared/types";

// --- Schema: รองรับทั้ง VN และ Phone ---
const formSchema = z
  .object({
    vn: z.string().optional(),
    phone: z.string().optional(),
  })
  .refine(
    (data) => {
      // ต้องกรอกอย่างน้อย 1 ช่อง
      const hasVN = data.vn && data.vn.trim().length > 0;
      const hasPhone = data.phone && data.phone.trim().length > 0;
      return hasVN || hasPhone;
    },
    {
      message: "กรุณากรอก Visit Number หรือ เบอร์โทรศัพท์ อย่างใดอย่างหนึ่ง",
      path: ["vn"], // แสดง error ที่ช่อง VN
    }
  );

type FormValues = z.infer<typeof formSchema>;

// --- Helper Functions ---
const formatVN = (inputVN: string) => {
  const vn = inputVN.trim();
  if (!vn) return "";

  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const datePrefix = `VN${yy}${mm}${dd}-`;

  if (/^\d+$/.test(vn)) return `${datePrefix}${vn.padStart(4, "0")}`;
  if (/^VN\d+$/i.test(vn)) {
    const num = vn.replace(/^VN/i, "");
    return `${datePrefix}${num.padStart(4, "0")}`;
  }
  return vn.toUpperCase();
};

interface PatientVNProps {
  onBack: () => void;
  onSuccess: (data: QueueData) => void;
}

const PatientVN = ({ onSuccess }: PatientVNProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vn: "",
      phone: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      let queueData: QueueData | null = null;
      let usedMethod = "";

      // 1. ลองค้นหาด้วย VN ก่อน (ถ้ามี)
      if (values.vn && values.vn.trim()) {
        const formattedVN = formatVN(values.vn);
        usedMethod = "VN";
        try {
          queueData = await API.getQueueByVN(formattedVN);
        } catch (e) {
          console.error(e);
        }
      }

      // 2. ถ้ายังไม่เจอ และมีการกรอกเบอร์โทร -> ลองค้นด้วยเบอร์โทร
      if (!queueData && values.phone && values.phone.trim()) {
        usedMethod = "Phone";
        try {
          queueData = await API.getQueueByPhone(values.phone.trim());
        } catch (e) {
          console.error(e);
        }
      }

      if (queueData) {
        onSuccess(queueData);
      } else {
        toast.error(
          `ไม่พบข้อมูลคิว (ตรวจสอบ ${
            usedMethod === "VN" ? "เลข VN" : "เบอร์โทรศัพท์"
          })`
        );
        form.setError("vn", { message: "ไม่พบข้อมูล กรุณาตรวจสอบความถูกต้อง" });
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header เดิมของระบบ */}
      <Header />

      <main className="flex-1 flex flex-col items-center justify-start pt-8 sm:pt-12 px-4">
        {/* Main Heading */}
        <div className="text-center space-y-1 mb-8">
          <h1 className="text-[#044C72] text-4xl font-bold tracking-tight">
            ตรวจสอบคิว
          </h1>
          <p className="text-gray-400 text-sm font-light">
            ตรวจสอบคิวของท่านด้วยเลข VN
          </p>
        </div>

        {/* Card Form - Styling ตามรูปภาพ */}
        <div className="w-full max-w-sm">
          <div
            className="bg-white rounded-[2rem] p-6 sm:p-8 relative"
            style={{
              border: "2px solid #6B9E36", // ขอบสีเขียวตามรูป
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* VN Input */}
                <FormField
                  control={form.control}
                  name="vn"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <label className="text-[#044C72] text-sm font-medium ml-1">
                        Visit Number (หมายเลขการมาใช้บริการ)
                      </label>
                      <FormControl>
                        <Input
                          placeholder="ตัวอย่าง: VN123112313"
                          className="h-11 border-[#BEBEBE] rounded-lg text-gray-600 placeholder:text-gray-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Input */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <label className="text-[#044C72] text-sm font-medium ml-1">
                        เบอร์โทรศัพท์
                      </label>
                      <FormControl>
                        <Input
                          placeholder="ตัวอย่าง: 0888888888"
                          className="h-11 border-[#BEBEBE] rounded-lg text-gray-600 placeholder:text-gray-300"
                          type="tel"
                          maxLength={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-4 flex justify-center">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-40 h-12 text-white font-bold text-lg rounded-2xl transition-all hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(to bottom, #87E74B, #72D238)",
                      boxShadow: "0 4px 6px rgba(114, 210, 56, 0.4)",
                    }}
                  >
                    {isLoading ? "กำลังค้นหา..." : "ตรวจสอบคิว"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>

      {/* Custom Footer ตามรูปภาพ */}
      <footer
        className="py-8 px-4 text-center mt-auto"
        style={{ backgroundColor: "#39AAAD" }} // สีพื้นหลัง Teal ตามรูป
      >
        <div className="container mx-auto space-y-2">
          <p className="text-white text-sm sm:text-base font-medium drop-shadow-sm">
            หากท่านได้ทำการออกหน้านี้
          </p>
          <p className="text-white text-sm sm:text-base font-medium drop-shadow-sm pb-2">
            ท่านสามารถสแกนคิวอาร์โค้ดใหม่ เพื่อเข้าดูหน้าคิวได้อีกครั้ง
          </p>

          <div className="flex items-center justify-center gap-2 text-white/90 text-xs sm:text-sm mt-4">
            <span>หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่</span>
            <User className="w-4 h-4 fill-white" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientVN;
