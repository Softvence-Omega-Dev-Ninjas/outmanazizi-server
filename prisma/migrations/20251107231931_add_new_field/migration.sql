-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_fromNotification_fkey" FOREIGN KEY ("fromNotification") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_toNotification_fkey" FOREIGN KEY ("toNotification") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
