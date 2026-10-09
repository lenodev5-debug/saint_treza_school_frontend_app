import AttendanceCard from "../../shared/cards/users/attendance";
import ReadingDashboard from "../../shared/cards/books/bookstroe";
import UserActiveCard from "../../shared/cards/users/chartsStatus";
import VisitsCard from "../../shared/cards/users/gradeProgress";
import MeetingCard from "../../shared/cards/users/metting";
import StudentsCard from "../../shared/cards/users/student/studentCard";
import FloatingMenu from "../../shared/ui/FloatingMenu";
import TeacherAssignmentList from "../teacher/teacherAssignmentList";
import Users from "../../shared/cards/users/user/users";

export default function AdminDashboard() {
    return (
        <div className="relative min-h-screen w-full bg-gray-50 p-4 pt-20 dark:bg-[#0f0f0f]">
            <div className="mx-auto w-full max-w-[1600px] space-y-4">

                <div className="flex items-center justify-between gap-2">
                    <UserActiveCard />
                    <VisitsCard />
                    <MeetingCard />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
                    <StudentsCard />
                    <AttendanceCard />
                </div>

                <div className="grid grid-cols-1">
                    <ReadingDashboard />
                </div>

                <div className="grid grid-cols-1">
                    <Users />
                </div>
            </div>

            <FloatingMenu />
        </div>
    );
}